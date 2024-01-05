// eslint-disable-next-line 
// @ts-nocheck

import { getLogger } from '../../../logging/log-util';
import {getDomainFromUrl, addDomainToImgSrc} from '../../../utils/index'
// 1. Import necessary modules
import { BraveSearch } from "langchain/tools";
import OpenAI from "openai";
import cheerio from "cheerio";
// 2. Initialize OpenAI and embeddings

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"

const loader = new BraveSearch({
  apiKey: process.env.BRAVE_SEARCH_API_KEY,
});


export function SOCKET(
    client: import('ws').WebSocket,
    request: import('http').IncomingMessage,
    server: import('ws').WebSocketServer,
  ) {
    console.log('A client connected!');
    const logger = getLogger('rag');
    client.on('message', async(message) => {
      console.log("message")
      var messageObject = JSON.parse(message.toString('utf8'))
      console.log(messageObject)
      if(messageObject.type=='chat') {
          const {
              message,
              openaiApiKey,
              numberOfPagesToScan = 4,
              selectedModel = 'gpt-3.5-turbo'
            }  = messageObject;

            let openAiConfig = {}
            if (selectedModel.includes('gpt')){
              openAiConfig  = {
                apiKey: openaiApiKey
              }
            } else {
              openAiConfig = {
                apiKey: openaiApiKey ? openaiApiKey: process.env.OPENROUTER_API_KEY,
                baseURL: OPENROUTER_BASE_URL,
              }
            }
            const openai = new OpenAI(openAiConfig);
            const rephrasedOutput = await openai.beta.chat.completions.stream({
              model: selectedModel,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a rephraser and always respond with a rephrased version of the input that is given to a search engine API. Always be succint and use the same words as the input.",
                },
                { role: "user", content: message },
              ],
              stream: true,
            });
            rephrasedOutput.on('content', (delta, snapshot) => {
              client.send(JSON.stringify({type: 'ragResponse', subType: "rephrasedMessage",rephrasedMessage: delta }));
            });
            const rephrasedFinalOutput =  await rephrasedOutput.finalChatCompletion();
            const rephrasedMessage = rephrasedFinalOutput.choices[0].message.content;
            const docs = await loader.call(rephrasedMessage, { count: 4 });

            const normalizedData = JSON.parse(docs)
              .filter(
                (doc) => doc.title && doc.link && !doc.link.includes("brave.com")
              )
              .slice(0, numberOfPagesToScan)
              .map(({ title, link }) => ({ title, link }));

              async function fetchPageContent(link:string) {
                logger.info(`6. Fetching page content for ${link}`);
                const response = await fetch(link);
                return extractMainContent(await response.text(), link);
              }
    
              function extractMainContent(html:string, link:string) {
                logger.info(`7. Extracting main content from HTML for ${link}`);
                const $ = cheerio.load(html);
                $("script, style, head, nav, footer, iframe, img").remove();
                return $("body").text().replace(/\s+/g, " ").trim();
              }
              const fetchAndProcess = async (item:any, index:number) => {
                const htmlContent = await fetchPageContent(item.link);
                if (htmlContent.length < 250) return null;
                const content = `Here is the content of the page: ${htmlContent}. \n 
                Give me gist of this content which helps answer query for search text: ${message}. Response should be html body. Include img tag wherever possible. Don't include form. Keep the word limit within 50 words`;
                const chatCompletion = await openai.beta.chat.completions.stream({
                  messages: [{ role: "user", content }],
                  model: selectedModel,
                  stream: true,
                });
                try {
                  chatCompletion.on('content', (delta, snapshot) => {
                    client.send(JSON.stringify({
                      type: 'ragResponse',
                      resultIndex: index,
                      subType: "similaritySearchPartialResults",
                      chunk: delta,
                      metadata: {
                        link:item.link
                      }
                    }));
                  });
                
                  const chatCompletionFinalOutput =  await chatCompletion.finalChatCompletion();
                  let pageContent =  await chatCompletionFinalOutput.choices[0].message.content;
                  const domain = getDomainFromUrl(item.link)
                  pageContent = addDomainToImgSrc(pageContent, domain)
                  // client.send(JSON.stringify({
                  //   type: 'ragResponse',
                  //   resultIndex: index,
                  //   subType: "similaritySearchResults",
                  //   similaritySearchResults: [{
                  //       pageContent: pageContent,
                  //       metadata: {
                  //         link:item.link
                  //       }
                  //     }]
                  // }));
                  return [{
                      pageContent: pageContent,
                      metadata: {
                        link:item.link
                      }
                    }
                  ]
                } catch(e) {
                  return []
                }
                
              };
            await Promise.all(normalizedData.map(fetchAndProcess))
        }
    });
    
    client.on('close', () => {
      console.log('A client disconnected!');
    });
  }

  export const GET = SOCKET;
  export const POST = SOCKET
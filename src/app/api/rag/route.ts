// eslint-disable-next-line 
// @ts-nocheck
import { type NextRequest } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "../../../utils/auth-options"
import {User} from '../../../models';
import { getLogger } from '../../../logging/log-util';
import {getDomainFromUrl, addDomainToImgSrc} from '../../../utils/index'
// 1. Import necessary modules
import { Chroma } from "langchain/vectorstores/chroma";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BraveSearch } from "langchain/tools";
import OpenAI from "openai";
import cheerio from "cheerio";
// 2. Initialize OpenAI and embeddings

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"


export async function POST(request: NextRequest) {
  const logger = getLogger('rag');
    // 4. Handle POST requests
    const session = await getServerSession( authOptions)
    if (session) {
        logger.info("1. Received POST request");
        // 5. Extract request data
        const {
          message,
          openaiApiKey,
          textChunkSize = 300,
          textChunkOverlap = 20,
          returnLLMResults = true,
          returnSimilaritySearchResults = true,
          numberOfSimilarityResults = 2,
          numberOfPagesToScan = 4,
          selectedModel = 'gpt-3.5-turbo'
        } = await request.json();
        let openAiConfig = {}
        if (selectedModel.includes('gpt')){
          openAiConfig= {
            apiKey: openaiApiKey
          }
        } else {
          openAiConfig = {
            apiKey: openaiApiKey ? openaiApiKey: process.env.OPENROUTER_API_KEY,
            baseURL: OPENROUTER_BASE_URL,
          }
        }
        const openai = new OpenAI(openAiConfig);
        logger.info("2. Destructured request data");
        
        const rephraseInput =  async function rephraseInput(inputString:string) {
          logger.info("4. Rephrasing input");
         
          const gptAnswer = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content:
                  "You are a rephraser and always respond with a rephrased version of the input that is given to a search engine API. Always be succint and use the same words as the input.",
              },
              { role: "user", content: inputString },
            ],
          });
        
          return gptAnswer.choices[0].message.content;
        }
       
        const searchEngineForSources = async function searchEngineForSources(
          message,
          textChunkSize,
          textChunkOverlap
        ) {
          logger.info("3. Initializing Search Engine Process");
        
          const loader = new BraveSearch({
            apiKey: process.env.BRAVE_SEARCH_API_KEY,
          });

          const rephrasedMessage = await rephraseInput(message);
          logger.info("5. Rephrased message and got documents from BraveSearch");

          const docs = await loader.call(rephrasedMessage, { count: 4 });

          function normalizeData(docs) {
            return JSON.parse(docs)
              .filter(
                (doc) => doc.title && doc.link && !doc.link.includes("brave.com")
              )
              .slice(0, numberOfPagesToScan)
              .map(({ title, link }) => ({ title, link }));
          }
          const normalizedData = normalizeData(docs);
    
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
   
          let vectorCount = 0;
          const fetchAndProcess = async (item:any) => {
            const htmlContent = await fetchPageContent(item.link);
            if (htmlContent.length < 250) return null;
            // const splitText = await new RecursiveCharacterTextSplitter({
            //   chunkSize: textChunkSize,
            //   chunkOverlap: textChunkOverlap,
            // }).splitText(htmlContent);
            // // const vectorStore = await MemoryVectorStore.fromTexts(
            // //   splitText,
            // //   { link: item.link },
            // //   embeddings
            // // );
            // console.log(item.link.replace(/[^a-zA-Z ]/g, "").substring(0, 45))
            
            // const vectorStore = await Chroma.fromTexts(splitText, { link: item.link }, new OpenAIEmbeddings({
            //   openAIApiKey: process.env.OPENAI_API_KEY,
            // }), {
            //   collectionName: `a-test-collection-${item.link.replace(/[^a-zA-Z ]/g, "").substring(0, 45)}`,
            //   // url: process.env.CHROMA_DB_URL, // Optional, will default to this value
            //   collectionMetadata: {
            //     "hnsw:space": "cosine",
            //   }, 
            // });

            // vectorCount++;
            // logger.info(
            //   `8. Processed ${vectorCount} out of ${normalizedData.length} sources for ${item.link}`
            // );
            // return await vectorStore.similaritySearch(
            //   message,
            //   numberOfSimilarityResults
            // );
       
            const content = `Here is the content of the page: ${htmlContent}. \n 
            Give me gist of this content which helps answer query for search text: ${message}. Response should be in html format. Include img tag wherever possible. Don't include form. Keep the word limit within 50 words`;
            const chatCompletion = await openai.chat.completions.create({
              messages: [{ role: "user", content }],
              model: selectedModel,
            });
            try {
              let pageContent =  await chatCompletion.choices[0].message.content;
            console.log(pageContent)
            const domain = getDomainFromUrl(item.link)
            pageContent = addDomainToImgSrc(pageContent, domain)
            getDomainFromUrl
            return [{
                pageContent: pageContent,
                metadata: {
                  link:item.link
                }
              }
            ]
            }catch(e) {
              return []
            }
            
          };
       
          return await Promise.all(normalizedData.map(fetchAndProcess));
        }
     
        const sources = await searchEngineForSources(
          message,
          textChunkSize,
          textChunkOverlap
        );
        logger.info("9. Got sources and preparing response content");
    
        const content = `Here are the top results from a similarity search: ${JSON.stringify(
          sources
        )}. Based on those, and this query "${message}", respond back with an answer ideally in a sentence or two.`;
        const chatCompletion = await openai.chat.completions.create({
          messages: [{ role: "user", content }],
          model: selectedModel,
        });
        logger.info("10. Sent content to OpenAI for chat completion");

        let responseObj:any = {};
        if (returnLLMResults) responseObj.llmResults = chatCompletion.choices;
        if (returnSimilaritySearchResults)
          responseObj.similaritySearchResults = sources;
        logger.info("11. Constructed response object");
        return Response.json(responseObj, {
          status: 201,
        });

    } else {
      return Response.json({status:"failed"}, {
        status: 201,
      });
    }

}


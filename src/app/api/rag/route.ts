// export const dynamic = 'force-dynamic' // defaults to force-static
import { type NextRequest } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import {User} from '../../../models';


// 1. Import necessary modules
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BraveSearch } from "langchain/tools";
import OpenAI from "openai";
import cheerio from "cheerio";
// 2. Initialize OpenAI and embeddings


// 3. Start the server

export async function POST(request: NextRequest) {

    // 4. Handle POST requests
    const session = await getServerSession( authOptions)
    if (session) {
        console.log("1. Received POST request");
        // 5. Extract request data
        const {
          message,
          openaiApiKey,
          textChunkSize = 200,
          textChunkOverlap = 20,
          returnLLMResults = true,
          returnSimilaritySearchResults = true,
          numberOfSimilarityResults = 2,
          numberOfPagesToScan = 4,
        } = await request.json();
        console.log(openaiApiKey)
        const openai = new OpenAI({
          apiKey: openaiApiKey,
        });
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: openaiApiKey,
        });
        
        console.log("2. Destructured request data");
        // 6. Define rephrase function
        async function rephraseInput(inputString:string) {
          console.log("4. Rephrasing input");
          // 7. Rephrase input using OpenAI
          const gptAnswer = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a rephraser and always respond with a rephrased version of the input that is given to a search engine API. Always be succint and use the same words as the input.",
              },
              { role: "user", content: inputString },
            ],
          });
          console.log("Gpt content",gptAnswer.choices[0].message.content)
          return gptAnswer.choices[0].message.content;
        }
        // 8. Define search engine function
        async function searchEngineForSources(
          message,
          textChunkSize,
          textChunkOverlap
        ) {
          console.log("3. Initializing Search Engine Process");
          // 9. Initialize BraveSearch
          const loader = new BraveSearch({
            apiKey: process.env.BRAVE_SEARCH_API_KEY,
          });
          // 10. Rephrase the message
          const rephrasedMessage = await rephraseInput(message);
          console.log("5. Rephrased message and got documents from BraveSearch");
          // 11. Get documents from BraveSearch
          const docs = await loader.call(rephrasedMessage, { count: 4 });
          // 12. Normalize data
          function normalizeData(docs) {
            return JSON.parse(docs)
              .filter(
                (doc) => doc.title && doc.link && !doc.link.includes("brave.com")
              )
              .slice(0, numberOfPagesToScan)
              .map(({ title, link }) => ({ title, link }));
          }
          const normalizedData = normalizeData(docs);
          // 13. Fetch page content
          async function fetchPageContent(link:string) {
            console.log(`6. Fetching page content for ${link}`);
            const response = await fetch(link);
            return extractMainContent(await response.text(), link);
          }
          // 14. Extract main content from the HTML page
          function extractMainContent(html:string, link:string) {
            console.log(`7. Extracting main content from HTML for ${link}`);
            const $ = cheerio.load(html);
            $("script, style, head, nav, footer, iframe, img").remove();
            return $("body").text().replace(/\s+/g, " ").trim();
          }
          // 15. Process and vectorize the content
          let vectorCount = 0;
          const fetchAndProcess = async (item:any) => {
            const htmlContent = await fetchPageContent(item.link);
            if (htmlContent.length < 250) return null;
            const splitText = await new RecursiveCharacterTextSplitter({
              chunkSize: textChunkSize,
              chunkOverlap: textChunkOverlap,
            }).splitText(htmlContent);
            const vectorStore = await MemoryVectorStore.fromTexts(
              splitText,
              { link: item.link },
              embeddings
            );
            vectorCount++;
            console.log(
              `8. Processed ${vectorCount} out of ${normalizedData.length} sources for ${item.link}`
            );
            return await vectorStore.similaritySearch(
              message,
              numberOfSimilarityResults
            );
          };
          // 16. Process all normalized data
          return await Promise.all(normalizedData.map(fetchAndProcess));
        }
        // 17. Fetch and process sources
        const sources = await searchEngineForSources(
          message,
          textChunkSize,
          textChunkOverlap
        );
        console.log("9. Got sources and preparing response content");
        // 18. Prepare the response content
        const content = `Here are the top results from a similarity search: ${JSON.stringify(
          sources
        )}. Based on those, and this query "${message}", respond back with an answer ideally in a sentence or two.`;
        const chatCompletion = await openai.chat.completions.create({
          messages: [{ role: "user", content }],
          model: "gpt-3.5-turbo",
        });
        console.log("10. Sent content to OpenAI for chat completion");
        // 19. Construct the response object
        let responseObj:any = {};
        if (returnLLMResults) responseObj.llmResults = chatCompletion.choices;
        if (returnSimilaritySearchResults)
          responseObj.similaritySearchResults = sources;
        console.log("11. Constructed response object");
        return Response.json(responseObj, {
            status: 201,
          });

    } else {
      return Response.json({status:"failed"}, {
        status: 201,
      });

    }
    

}

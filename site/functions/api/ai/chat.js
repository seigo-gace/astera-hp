import { json, methodNotAllowed, sameOrigin, requestId, limitedText } from '../../_shared.js';
const types=new Set(['general','technical','corporate','investor','operation']);
export async function onRequestPost({request,env}){
  if(!sameOrigin(request))return json({error:{code:'ORIGIN_DENIED'}},403);
  if(!env.CUSTOMER_AI_URL)return json({error:{code:'SERVICE_UNAVAILABLE',retryable:true}},503);
  const id=requestId(request); let body;
  try{body=await request.json();}catch{return json({error:{code:'INVALID_JSON',requestId:id}},400);}
  const message=limitedText(body.message,12000); const answerType=types.has(body.answerType)?body.answerType:'general';
  const history=Array.isArray(body.history)?body.history.slice(-20).map(item=>({role:item.role==='assistant'?'assistant':'user',content:limitedText(item.content,12000)})):[];
  if(!message)return json({error:{code:'MESSAGE_REQUIRED',requestId:id}},400);
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort('timeout'),30000);
  try{const response=await fetch(env.CUSTOMER_AI_URL,{method:'POST',headers:{'content-type':'application/json','authorization':env.CUSTOMER_AI_TOKEN?`Bearer ${env.CUSTOMER_AI_TOKEN}`:'','x-request-id':id},body:JSON.stringify({sessionId:limitedText(body.sessionId,120),answerType,message,history,pageContext:body.pageContext||{}}),signal:controller.signal});if(!response.ok||!response.body)return json({error:{code:'UPSTREAM_ERROR',requestId:id,retryable:response.status>=500}},response.status>=500?503:502);return new Response(response.body,{status:200,headers:{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-cache, no-transform','x-accel-buffering':'no','x-request-id':id}});}catch(error){return json({error:{code:error?.name==='AbortError'?'TIMEOUT':'UPSTREAM_UNAVAILABLE',requestId:id,retryable:true}},503);}finally{clearTimeout(timer);}
}
export function onRequest(){return methodNotAllowed('POST');}

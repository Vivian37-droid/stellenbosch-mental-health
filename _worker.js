const end = Date.parse('2026-11-01T00:00:00+02:00');
const start = Date.parse('2026-10-01T00:00:00+02:00');
const choices = {service_use:['yes','no','prefer_not'],support_knowledge:['yes','somewhat','no'],helpfulness:['very','somewhat','not']};
const json = (data,status=200) => new Response(JSON.stringify(data), {status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default {async fetch(request,env) {
 const url=new URL(request.url);
 if(url.pathname!=='/api/survey') return env.ASSETS.fetch(request);
 const open=Date.now()>=start && Date.now()<end;
 if(request.method==='GET' && !url.searchParams.has('export')) return json({ready:Boolean(env.SURVEY_RESPONSES)&&open});
 if(request.method==='GET') {
  if(!env.SURVEY_REPORT_TOKEN || request.headers.get('Authorization')!=='Bearer '+env.SURVEY_REPORT_TOKEN) return json({error:'Unauthorized'},401);
  if(!env.SURVEY_RESPONSES) return json({error:'Storage unavailable'},503);
  const month=url.searchParams.get('month')||'2026-10';
  if(!/^\d{4}-\d{2}$/.test(month)) return json({error:'Invalid month'},400);
  const rows=[];let cursor;
  do {
   const page=await env.SURVEY_RESPONSES.list({prefix:'response:'+month+':',...(cursor?{cursor}:{})});
   for(const item of page.keys){const value=await env.SURVEY_RESPONSES.get(item.name,'json');if(value)rows.push(value);}
   cursor=page.list_complete?undefined:page.cursor;
  }while(cursor);
  const counts=Object.fromEntries(Object.entries(choices).map(([key,options])=>[key,Object.fromEntries(options.map(option=>[option,rows.filter(row=>row[key]===option).length]))]));
  if(url.searchParams.get('export')==='csv'){
   const lines=['submission_date,service_use,support_knowledge,helpfulness',...rows.map(r=>[r.submission_date,r.service_use,r.support_knowledge,r.helpfulness].join(','))];
   return new Response(lines.join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="survey-'+month+'.csv"','Cache-Control':'no-store'}});
  }
  return json({month,total:rows.length,counts});
 }
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(!env.SURVEY_RESPONSES||!open)return json({error:'Survey unavailable'},503);
 if(request.headers.get('Origin')!==url.origin)return json({error:'Invalid origin'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Invalid content type'},415);
 if(Number(request.headers.get('Content-Length')||0)>2048)return json({error:'Too large'},413);
 try{
  const text=await request.text();if(text.length>2048)return json({error:'Too large'},413);
  const data=JSON.parse(text);
  if(data.website||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id||''))return json({error:'Invalid submission'},400);
  for(const [key,options]of Object.entries(choices))if(!options.includes(data[key]))return json({error:'Invalid answer'},400);
  const date=new Date(Date.now()+7200000).toISOString().slice(0,10);
  const record={submission_date:date,...Object.fromEntries(Object.keys(choices).map(key=>[key,data[key]]))};
  await env.SURVEY_RESPONSES.put('response:'+date.slice(0,7)+':'+data.id,JSON.stringify(record));
  return json({saved:true});
 }catch{return json({error:'Unable to save'},503);}
}};

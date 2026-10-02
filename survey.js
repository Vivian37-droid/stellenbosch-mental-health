(()=>{
 const key='stellenbosch-survey-oct-2026',invite=document.getElementById('survey-invite'),dialog=document.getElementById('survey-dialog'),form=document.getElementById('survey-form'),error=document.getElementById('survey-error'),submit=document.getElementById('survey-submit');
 let ready=false,record={};try{record=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
 const remember=()=>{try{localStorage.setItem(key,JSON.stringify(record));}catch{}};
 const dismiss=()=>{invite.hidden=true;record.seen=true;remember();};
 document.getElementById('survey-dismiss').addEventListener('click',dismiss);
 document.getElementById('survey-close').addEventListener('click',()=>dialog.close());
 document.querySelectorAll('.survey-open').forEach(button=>button.addEventListener('click',()=>{if(!ready)return;dismiss();dialog.showModal();}));
 fetch('/api/survey',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(status=>{
  ready=Boolean(status?.ready);if(!ready||record.submitted)return;
  document.querySelectorAll('.survey-entry').forEach(el=>el.hidden=false);
  if(!record.seen)setTimeout(()=>{
   if([...document.querySelectorAll('video')].some(v=>!v.paused))document.querySelectorAll('video').forEach(v=>v.addEventListener('ended',()=>{if(!record.seen)invite.hidden=false;},{once:true}));
   else if(!record.seen)invite.hidden=false;
  },30000);
 }).catch(()=>{});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!ready||!form.reportValidity())return;submit.disabled=true;error.hidden=true;
  record.id ||=crypto.randomUUID();remember();const data=Object.fromEntries(new FormData(form));
  try{
   const response=await fetch('/api/survey',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id:record.id})});
   if(!response.ok)throw new Error('save failed');record.submitted=true;remember();form.hidden=true;document.getElementById('survey-thanks').hidden=false;document.getElementById('survey-thanks').focus();document.querySelectorAll('.survey-entry').forEach(el=>el.hidden=true);
  }catch{error.textContent=document.documentElement.lang==='af'?'Jou antwoorde is nog nie gestoor nie. Probeer asseblief weer.':'Your answers have not been saved yet. Please try again.';error.hidden=false;}finally{submit.disabled=false;}
 });
})();

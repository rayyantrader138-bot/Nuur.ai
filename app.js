"use strict";
const $=id=>document.getElementById(id);
const L={en:{sub:"Smart assistant: chat & images",chat:"Chat",img:"Images",ph1:"Ask me anything…",ph2:"Describe an image, or attach a photo and say what to change…",hi:"How can I help you today?",hi2:"Create an image, or attach a photo to edit it",edit:"Editing your photo",dl:"Download",use:"Edit this",again:"Redo",mt:"Settings",lp:"AI provider",lk:"Your API key",note:"Your key is saved only in this browser and sent only to the provider you chose.",save:"Save",cancel:"Cancel",nokey:"Add your API key in Settings first.",sys:"You are Nuur, a warm, professional AI assistant. Reply in English unless the user writes in another language.",sr:"en-US",s1:["Explain AI simply","Write a short poem","Plan my day"],s2:["A sunset over mountains","A cute robot with flowers","Futuristic city at night"],nov:"Voice input isn't supported in this browser."},
ur:{sub:"سمارٹ اسسٹنٹ: چیٹ اور تصاویر",chat:"چیٹ",img:"تصاویر",ph1:"مجھ سے کچھ بھی پوچھیں…",ph2:"تصویر کا حال لکھیں، یا اپنی تصویر لگا کر بتائیں کیا بدلنا ہے…",hi:"میں آج آپ کی کیا مدد کروں؟",hi2:"تصویر بنوائیں، یا اپنی تصویر لگا کر ایڈٹ کروائیں",edit:"آپ کی تصویر ایڈٹ ہو رہی ہے",dl:"ڈاؤن لوڈ",use:"ایڈٹ کریں",again:"دوبارہ",mt:"سیٹنگز",lp:"اے آئی فراہم کنندہ",lk:"آپ کی API کی",note:"آپ کی کی صرف اسی براؤزر میں محفوظ رہتی ہے اور صرف منتخب فراہم کنندہ کو بھیجی جاتی ہے۔",save:"محفوظ کریں",cancel:"منسوخ",nokey:"پہلے سیٹنگز میں API کی ڈالیں۔",sys:"You are Nuur, a warm, professional AI assistant. Always reply in fluent, natural Urdu (Urdu script) unless the user clearly writes in another language.",sr:"ur-PK",s1:["اے آئی آسان الفاظ میں سمجھائیں","ایک چھوٹی نظم لکھیں","میرا دن پلان کریں"],s2:["پہاڑوں پر غروبِ آفتاب","پھولوں کے ساتھ ایک پیارا روبوٹ","رات کا مستقبل کا شہر"],nov:"اس براؤزر میں وائس سپورٹ نہیں۔"}};
const DEF={gemini:{chat:"gemini-2.5-flash",img:"gemini-2.5-flash-image"},openai:{chat:"gpt-4o-mini",img:"gpt-image-1"}};
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let lang=ld("lang","en"),ti=ld("theme",0),cfg=ld("cfg",{prov:"gemini",key:"",chat:"",img:""}),pane="chat",busy=false,hist=[],gens=[],att=null,rec=null;
const themes=["dark","dim","light"],T=()=>L[lang];
const ico={dark:'<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',dim:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2" opacity=".5"/>',light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'};
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const mc=()=>cfg.chat||DEF[cfg.prov].chat,mi=()=>cfg.img||DEF[cfg.prov].img;
function toast(m){const t=$("toast");t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,5000)}
function applyTheme(){document.documentElement.dataset.theme=themes[ti];$("theme").innerHTML='<svg viewBox="0 0 24 24">'+ico[themes[ti]]+'</svg>';sv("theme",ti)}
function render(){
 const t=T(),d=document.documentElement;d.lang=lang;d.dir=lang==="ur"?"rtl":"ltr";
 $("t_sub").textContent=t.sub;$("t_chat").textContent=t.chat;$("t_img").textContent=t.img;$("t_edit").textContent=t.edit;
 $("lang").textContent=lang==="ur"?"English":"اردو";$("in").placeholder=pane==="chat"?t.ph1:t.ph2;
 $("pick").hidden=pane!=="img";$("att").hidden=!(att&&pane==="img");
 const logo='<div class="logo"><svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/></svg></div>';
 const chips=a=>'<div class="chips">'+a.map(x=>'<button class="chip" data-q="'+esc(x)+'">'+esc(x)+'</button>').join("")+'</div>';
 const dots='<div class="dots" style="text-align:center;padding:26px"><span></span><span></span><span></span></div>';
 $("p_chat").innerHTML=hist.length?hist.map(m=>'<div class="msg '+(m.role==="user"?"me":"bot")+(m.err?" err":"")+'">'+esc(m.content)+'</div>').join("")+(busy&&pane==="chat"?'<div class="msg bot">'+dots.replace("26px","0")+'</div>':""):'<div class="empty">'+logo+'<div>'+t.hi+'</div>'+chips(t.s1)+'</div>';
 $("p_img").innerHTML=gens.length||busy&&pane==="img"?gens.map((g,i)=>'<div class="gen"><p>'+esc(g.p)+'</p><img alt="" src="'+g.u+'"><div class="row"><button class="btn" data-dl="'+i+'">'+t.dl+'</button><button class="btn" data-use="'+i+'">'+t.use+'</button><button class="btn" data-re="'+i+'">'+t.again+'</button></div></div>').join("")+(busy?'<div class="gen">'+dots+'</div>':""):'<div class="empty">'+logo+'<div>'+t.hi2+'</div>'+chips(t.s2)+'</div>';
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("on",b.dataset.p===pane));
 $("p_chat").classList.toggle("on",pane==="chat");$("p_img").classList.toggle("on",pane==="img");
 $("main").scrollTop=$("main").scrollHeight;
}
async function call(url,opt){const r=await fetch(url,opt);let j={};try{j=await r.json()}catch(e){}if(!r.ok)throw new Error((j.error&&(j.error.message||j.error))||("HTTP "+r.status));return j}
async function chatAPI(){
 if(cfg.prov==="gemini"){
  const j=await call("https://generativelanguage.googleapis.com/v1beta/models/"+mc()+":generateContent?key="+encodeURIComponent(cfg.key),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:T().sys}]},contents:hist.filter(m=>!m.err).map(m=>({role:m.role==="user"?"user":"model",parts:[{text:m.content}]}))})});
  return (j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("")||"…";
 }
 const j=await call("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+cfg.key},body:JSON.stringify({model:mc(),messages:[{role:"system",content:T().sys}].concat(hist.filter(m=>!m.err).map(m=>({role:m.role,content:m.content})))})});
 return j.choices[0].message.content;
}
async function imageAPI(prompt){
 if(cfg.prov==="gemini"){
  const parts=[{text:prompt}];if(att)parts.push({inlineData:{mimeType:att.mime,data:att.b64}});
  const j=await call("https://generativelanguage.googleapis.com/v1beta/models/"+mi()+":generateContent?key="+encodeURIComponent(cfg.key),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{responseModalities:["TEXT","IMAGE"]}})});
  const ps=j.candidates?.[0]?.content?.parts||[],p=ps.find(x=>x.inlineData||x.inline_data);
  if(!p){throw new Error(ps.map(x=>x.text||"").join(" ").trim()||"No image returned")}
  const d=p.inlineData||p.inline_data;return "data:"+(d.mimeType||d.mime_type||"image/png")+";base64,"+d.data;
 }
 let j;
 if(att){const f=new FormData();f.append("model",mi());f.append("prompt",prompt);f.append("image",att.blob,"photo.png");
  j=await call("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:"Bearer "+cfg.key},body:f});}
 else j=await call("https://api.openai.com/v1/images/generations",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+cfg.key},body:JSON.stringify({model:mi(),prompt,size:"1024x1024"})});
 const x=j.data[0];return x.b64_json?"data:image/png;base64,"+x.b64_json:x.url;
}
async function ask(q){
 if(!q||busy)return;if(!cfg.key){toast(T().nokey);openModal();return}
 busy=true;$("in").value="";$("in").style.height="auto";
 try{
  if(pane==="chat"){hist.push({role:"user",content:q});render();hist.push({role:"assistant",content:await chatAPI()})}
  else{render();const u=await imageAPI(q);gens.push({p:q,u});}
 }catch(e){if(pane==="chat")hist.push({role:"assistant",content:"⚠ "+e.message,err:1});else toast("⚠ "+e.message)}
 busy=false;render();
}
function setAtt(dataUrl,blob){const m=dataUrl.match(/^data:(.*?);base64,(.*)$/);att={mime:m[1],b64:m[2],blob,url:dataUrl};$("attimg").src=dataUrl;render()}
function toBlob(c,m){return new Promise(r=>c.toBlob(r,m))}
$("file").onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image(),u=URL.createObjectURL(f);
 im.onload=async()=>{const s=Math.min(1,1280/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);setAtt(c.toDataURL("image/png"),await toBlob(c,"image/png"))};
 im.src=u;e.target.value=""};
async function useGen(i){const u=gens[i].u,b=await (await fetch(u)).blob();setAtt(u,b);$("in").focus()}
function openModal(){$("prov").value=cfg.prov;$("key").value=cfg.key;$("mchat").value=cfg.chat;$("mimg").value=cfg.img;phs();$("m_t").textContent=T().mt;$("l_prov").textContent=T().lp;$("l_key").textContent=T().lk;$("m_note").textContent=T().note;$("m_save").textContent=T().save;$("m_cancel").textContent=T().cancel;$("modal").hidden=false}
function phs(){const p=$("prov").value;$("mchat").placeholder=DEF[p].chat;$("mimg").placeholder=DEF[p].img}
$("prov").onchange=phs;$("settings").onclick=openModal;$("m_cancel").onclick=()=>$("modal").hidden=true;
$("m_save").onclick=()=>{cfg={prov:$("prov").value,key:$("key").value.trim(),chat:$("mchat").value.trim(),img:$("mimg").value.trim()};sv("cfg",cfg);$("modal").hidden=true};
$("send").onclick=()=>ask($("in").value.trim());
$("in").onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask($("in").value.trim())}};
$("in").oninput=e=>{e.target.style.height="auto";e.target.style.height=Math.min(120,e.target.scrollHeight)+"px"};
$("lang").onclick=()=>{lang=lang==="en"?"ur":"en";sv("lang",lang);render()};
$("theme").onclick=()=>{ti=(ti+1)%3;applyTheme()};
$("clear").onclick=()=>{if(pane==="chat")hist=[];else{gens=[];att=null}render()};
$("pick").onclick=()=>$("file").click();$("attx").onclick=()=>{att=null;render()};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{pane=b.dataset.p;render()});
document.addEventListener("click",e=>{
 const c=e.target.closest("[data-q]"),d=e.target.closest("[data-dl]"),u=e.target.closest("[data-use]"),r=e.target.closest("[data-re]");
 if(c)ask(c.dataset.q);
 if(d){const a=document.createElement("a");a.href=gens[+d.dataset.dl].u;a.download="nuur-image.png";a.click()}
 if(u)useGen(+u.dataset.use);
 if(r)ask(gens[+r.dataset.re].p);
});
$("mic").onclick=()=>{
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return toast(T().nov);
 if(rec){rec.stop();return}
 rec=new SR();rec.lang=T().sr;rec.interimResults=true;
 rec.onresult=e=>{$("in").value=[...e.results].map(x=>x[0].transcript).join("")};
 rec.onend=rec.onerror=()=>{rec=null;$("mic").classList.remove("rec")};
 rec.start();$("mic").classList.add("rec");
};
applyTheme();render();

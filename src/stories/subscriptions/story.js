import { SCENES, getStoryState } from './story-model.js';
import { SIDE_STORIES } from './side-stories.js';
import { createFilmRenderer } from './film-renderer.js';
import { initPlayground } from './playground.js';
const $ = id => document.getElementById(id);
const clamp = n => Math.max(0,Math.min(1,n));
const smooth = n => {n=clamp(n);return n*n*(3-2*n);};
const film=$('film-scroll'),stage=$('film-stage'),caption=$('film-caption');
const renderer=createFilmRenderer($('world'));
const playground=initPlayground(document.querySelector('.lab'));
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const dots=[...document.querySelectorAll('.scene-dots a')];
const artScenes=[{id:0,opacity:.48},{id:1,opacity:.20},{id:1,opacity:.12},{id:1,opacity:.12},{id:1,opacity:.18},{id:0,opacity:.32}];
let reduced=motionQuery.matches,scene=-1,state=getStoryState(0,0),progress=0;
let height=stage.clientHeight,mobile=innerWidth<=650,frame=0,last=0,time=0,inFilm=true;
let restoreFocus=null,scrollQueued=false;
function changeScene(index){
 scene=index;const data=SCENES[index];stage.dataset.sceneIndex=String(index);
 $('scene-eyebrow').textContent=data.eyebrow;$('scene-title').innerHTML=data.title;$('scene-line').textContent=data.caption;
 $('film-position').textContent=`0${index+1} / 06`;
 dots.forEach((dot,i)=>{dot.classList.toggle('active',i===index);if(i===index)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current');});
 $('coverage-legend').hidden=index===0;
}
function update(){
 const rect=film.getBoundingClientRect(),range=Math.max(1,film.offsetHeight-height);
 progress=clamp(-rect.top/range);inFilm=rect.bottom>0&&rect.top<height;
 const raw=progress*SCENES.length,index=Math.min(SCENES.length-1,Math.floor(raw)),phase=clamp(raw-index);
 state=getStoryState(index,phase);if(scene!==index)changeScene(index);
 const fadeIn=index===0?1:smooth(phase/.10),fadeOut=index===5?1:1-smooth((phase-.92)/.08);
 const alpha=reduced?1:fadeIn*fadeOut;
 caption.style.opacity=String(alpha);
 caption.style.transform=reduced?'':`translateY(${mobile?0:-30}%) translate3d(0,${(1-phase)*12}px,0)`;
 $('scene-data').hidden=false;
 $('scene-data').style.opacity=String(reduced?1:Math.max(.65,alpha));
 $('data-caption').textContent=state.numberLabel;$('scene-number').textContent=String(state.total);
 $('data-after').textContent=`DAY ${state.day}`;
 $('proposed').hidden=true;
 $('scene-aside').hidden=true;
 $('world').setAttribute('aria-label',`${SCENES[index].eyebrow}. Day ${state.day}: ${state.total} seats. ${SCENES[index].caption}`);
 $('film-begin').hidden=index!==0;
 $('film-begin').style.opacity=String(1-smooth(phase/.8));
 $('film-end').style.opacity=index===5?'1':'0';$('film-end').style.visibility=index===5?'visible':'hidden';
 $('film-progress').style.width=`${progress*100}%`;
 const a=artScenes[index],prev=artScenes[Math.max(0,index-1)],cross=smooth(phase/.2),op=[0,0];
 if(a.id===prev.id)op[a.id]=prev.opacity+(a.opacity-prev.opacity)*cross;
 else {op[prev.id]=prev.opacity*(1-cross);op[a.id]=a.opacity*cross;}
 const roll=reduced?0:Math.sin(progress*Math.PI*3.5)*3.3;
 ['ribbon-art','ledger-art'].forEach((id,i)=>{const image=$(id);image.style.opacity=String(op[i]);image.style.transform=reduced?'scale(1.05)':`scale(${1.10+progress*.13}) translate3d(${Math.sin(progress*5)*-2}%,${(phase-.5)*-2}%,0) rotate(${roll*(i?-.55:1)}deg)`;});
 requestDraw();
}
function requestDraw(){if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
function draw(now){
 frame=0;if(!reduced&&last)time+=Math.min((now-last)/1000,.05);last=now;
 renderer.draw(state,time,reduced);
 if(!reduced&&inFilm&&!document.hidden&&!$('hood-dialog').open)requestDraw();
}
function resize(){
 height=stage.clientHeight;mobile=innerWidth<=650;renderer.resize();playground.resize();
 const range=film.offsetHeight-height;
 dots.forEach((dot,i)=>{$(`scene-${i}`).style.top=`${range*((i+(i===0?0:.16))/SCENES.length)}px`;});
 $('story').style.top=$('scene-1').style.top;
 update();
}
function syncMotion(){
 document.documentElement.classList.toggle('reduced-motion',reduced);
 $('motion-toggle').textContent=reduced?'Full motion':'Reduce motion';$('motion-toggle').setAttribute('aria-pressed',String(reduced));last=0;update();
}
$('motion-toggle').addEventListener('click',()=>{reduced=!reduced;syncMotion();});
motionQuery.addEventListener('change',e=>{reduced=e.matches;syncMotion();});
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;update();});}},{passive:true});
window.addEventListener('resize',resize);
window.addEventListener('pageshow',resize);
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestDraw();});
function openNote(data=SCENES[scene]){
 restoreFocus=document.activeElement;
 $('hood-eyebrow').textContent=data.eyebrow;$('hood-title').textContent=data.noteTitle;$('hood-note').textContent=data.note;
 $('hood-facts').replaceChildren();
 data.facts.forEach(fact=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=fact.label;dd.textContent=fact.value;$('hood-facts').append(dt,dd);});
 $('hood-dialog').showModal();document.documentElement.style.overflow='hidden';
}
$('hood-open').addEventListener('click',()=>openNote());
document.querySelectorAll('[data-side-story]').forEach(button=>button.addEventListener('click',()=>openNote(SIDE_STORIES[Number(button.dataset.sideStory)])));
$('hood-close').addEventListener('click',()=>$('hood-dialog').close());
$('hood-dialog').addEventListener('click',event=>{if(event.target!==$('hood-dialog'))return;const r=$('hood-dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('hood-dialog').close();});
$('hood-dialog').addEventListener('close',()=>{document.documentElement.style.overflow='';restoreFocus?.focus({preventScroll:true});last=0;requestDraw();});
['ribbon-art','ledger-art'].forEach(id=>$(id).addEventListener('error',()=>document.body.classList.add('no-assets')));
resize();syncMotion();

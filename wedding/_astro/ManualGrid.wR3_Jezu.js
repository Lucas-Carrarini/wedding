import{j as e}from"./jsx-runtime.D3GSbgeI.js";import{r as c}from"./index.yGrMsBkE.js";import"./index.yBjzXJbu.js";const b=3;function w(l,n){const r=[];for(let a=0;a<l.length;a+=n)r.push(l.slice(a,a+n));return r}function p(l){return e.jsxs("div",{className:"mt-3 rounded-2xl bg-white p-5 shadow-soft sm:mt-4 sm:p-6",children:[e.jsx("div",{className:"prose prose-neutral max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-h2:mt-0 prose-h2:text-xl sm:prose-h2:text-2xl",dangerouslySetInnerHTML:{__html:l.contentHtml}}),l.redirectTo&&l.redirectLabel?e.jsx("div",{className:"mt-5",children:e.jsx("a",{href:l.redirectTo,className:"inline-flex rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-neutral-800",children:l.redirectLabel})}):null]})}function N({items:l}){const[n,r]=c.useState(null),[a,d]=c.useState(null),u=w(l,b),f=n!==null,h=t=>{if(n?.id===t.id){d(t),r(null);return}n&&d(n),r(t)},x=()=>d(null);return e.jsxs("div",{className:"mx-auto max-w-md sm:max-w-lg",children:[u.map((t,m)=>e.jsxs("div",{children:[e.jsx("div",{className:"grid grid-cols-3 gap-0",children:t.map((s,o)=>{const i=n?.id===s.id,g=!f&&(m===0&&o===0);return e.jsx("button",{type:"button",onClick:()=>h(s),"aria-label":s.title,"aria-expanded":i,className:`relative z-0 aspect-square overflow-hidden bg-white shadow-soft transition active:scale-[0.98] ${g?"ll-manual-pulse":""} ${i?"z-10 ring-2 ring-inset ring-brand-500":""}`,children:e.jsx("img",{src:s.iconUrl,alt:"",className:"absolute inset-0 h-full w-full object-contain p-3 sm:p-4"})},s.id)})}),(()=>{const s=t.find(i=>i.id===n?.id)?n:null,o=t.find(i=>i.id===a?.id)?a:null;return e.jsxs(e.Fragment,{children:[o?e.jsx("div",{className:"ll-manual-panel-close overflow-hidden",onAnimationEnd:x,children:e.jsx("div",{className:"min-h-0",children:p(o)})},`close-${o.id}`):null,s?e.jsx("div",{className:"ll-manual-panel-open overflow-hidden",children:e.jsx("div",{className:"min-h-0",children:p(s)})},`open-${s.id}`):null]})})()]},`row-${m}`)),e.jsx("style",{children:`
        @keyframes ll-manual-pulse-kf {
          0%   { box-shadow: inset 0 0 0 2px rgba(217, 119, 6, 0.55); }
          70%  { box-shadow: inset 0 0 0 14px rgba(217, 119, 6, 0); }
          100% { box-shadow: inset 0 0 0 14px rgba(217, 119, 6, 0); }
        }
        .ll-manual-pulse {
          animation: ll-manual-pulse-kf 1.8s ease-out infinite;
        }

        @keyframes ll-manual-panel-open-kf {
          from { grid-template-rows: 0fr; opacity: 0; }
          to { grid-template-rows: 1fr; opacity: 1; }
        }
        .ll-manual-panel-open {
          display: grid;
          grid-template-rows: 1fr;
          animation: ll-manual-panel-open-kf 450ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes ll-manual-panel-close-kf {
          from { grid-template-rows: 1fr; opacity: 1; }
          to { grid-template-rows: 0fr; opacity: 0; }
        }
        .ll-manual-panel-close {
          display: grid;
          grid-template-rows: 0fr;
          animation: ll-manual-panel-close-kf 450ms cubic-bezier(0.22, 1, 0.36, 1);
        }
      `})]})}export{N as default};

(()=>{"use strict";const e=10,t=10,n=["carrier","battleship","destroyer","submarine","patrol-boat"],r=Object.freeze({HUMAN:Symbol("human"),COMPUTER:Symbol("computer")}),o=(e,t)=>({type:e,length:t}),a=Object.freeze({CARRIER:o("carrier",5),BATTLESHIP:o("battleship",4),DESTROYER:o("destroyer",3),SUBMARINE:o("submarine",3),PATROL_BOAT:o("patrol-boat",2)}),i=Object.freeze({UNKNOWN:Symbol("unknown"),MISSED:Symbol("missed"),HIT:Symbol("hit")}),c=Object.freeze({SHIPS:"planning-ships",NAME:"name",OPPONENT:"opponent"});function l(e){return Math.floor(Math.random()*e)}function s(e){const t=e.slice();for(let e=t.length-1;e>0;e--){const n=l(e+1);[t[e],t[n]]=[t[n],t[e]]}return t}function u(n,r){const o=function(){let n={},r=new Array(e).fill(null).map((()=>new Array(t).fill(null)));const o=new Array(e).fill(null).map((()=>new Array(t).fill(i.UNKNOWN)));return{getAllShips:function(){return Object.values(n).reduce(((e,t)=>(e.push(t.ship),e)),[])},getShip:function(e,t){return r[e][t]},setShip:function(e,t,o,a){const i=e.getLength();for(let n=0;n<i;n++){const i=a?o:o+n;r[a?t+n:t][i]=e}n[e.getType()]={ship:e,row:t,col:o,isVertical:a}},getInfoBoard:function(){return o.map((e=>[...e]))},getTileInfo:function(e,t){return o[e][t]},receiveAttack:function(e,t){r[e][t]?(r[e][t].hit(),o[e][t]=i.HIT):o[e][t]=i.MISSED},isFleetSunk:function(){return Object.values(n).every((e=>e.ship.isSunk()))},isValidPlacement:function(n,o,a,i){const c=n.getLength();if(i){if(o+c>e)return!1}else if(a+c>t)return!1;for(let e=0;e<c;e++){const t=i?a:a+e;if(![n,null].includes(r[i?o+e:o][t]))return!1}return!0},getInitialPosition:function(e){if(!n[e])return;const t=n[e];return{row:t.row,col:t.col,isVertical:t.isVertical}},removeShip:function(e,t){if(null===r[e][t])throw new Error("Cannot remove ship, no ship exists at location");const o=r[e][t].getType(),{ship:a,row:i,col:c,isVertical:l}=n[o],s=a.getLength();for(let e=0;e<s;e++){const t=l?c:c+e;r[l?i+e:i][t]=null}delete n[o]},removeAllShips:function(){r=new Array(e).fill(null).map((()=>new Array(t).fill(null))),n={}}}}(),a=function(e,t){return o.getShip(e,t)};return{getAllShips:function(){return o.getAllShips()},getName:function(){return n},getType:function(){return r},setName:function(e){n=e},getShip:a,setShip:function(e,t,n){let r=arguments.length>3&&void 0!==arguments[3]&&arguments[3];o.setShip(e,t,n,r)},getInfoBoard:function(){return o.getInfoBoard()},getTileInfo:function(e,t){return o.getTileInfo(e,t)},receiveAttack:function(e,t){o.receiveAttack(e,t)},isFleetSunk:function(){return o.isFleetSunk()},isValidPlacement:function(e,t,n,r){return o.isValidPlacement(e,t,n,r)},getShipType:function(e,t){const n=a(e,t);return null===n?"":n.getType()},removeAllShips:function(){o.removeAllShips()},getInitialPosition:function(e){return o.getInitialPosition(e)},removeShip:function(e,t){o.removeShip(e,t)}}}const d=Object.freeze({carrier:5,battleship:4,destroyer:3,submarine:3,"patrol-boat":2});function f(e){const t=d[e];if(!t)throw new Error("Invalid ship type");let n=0;const r=function(){return n===t};return{getLength:function(){return t},isSunk:r,hit:function(){r()||(n+=1)},getType:function(){return e}}}const g=document.querySelector(".planning-modal"),p=document.querySelector(".planning-modal > form"),m=document.querySelector(".player-1.gameboard"),h=document.querySelector(".player-2.gameboard"),S=document.querySelector(".content .buttons"),y=document.querySelector(`#${c.SHIPS}`),v=document.querySelector(".planning-modal .gameboard"),L=document.querySelector("#computer"),b=document.querySelector("#player"),N=function(e,t){const n=document.createElement("button");return n.type="button",n.textContent=e,n.classList.add("btn",t),n},E=function(n){for(let r=0;r<e;r++)for(let e=0;e<t;e++)n(r,e)};document.querySelectorAll(".gameboard").forEach((e=>{E(((t,n)=>{const r=function(e,t){const n=document.createElement("div");return n.dataset.row=e,n.dataset.col=t,n.classList.add("grid-cell"),n.style.gridArea=`${e+1} / ${t+1} / span 1 / span 1`,n}(t,n);e.appendChild(r)}))}));const q=function(e){return e?m:h},T=function(e,t){const n=q(e);E(((e,r)=>{const o=n.querySelector(`[data-row="${e}"][data-col="${r}"]`);t.getShip(e,r)&&!t.getShip(e,r).isSunk()&&o.classList.add("ship-cell")}))},A=function(e){document.querySelector(".status").textContent=e},I=function(){S.replaceChildren(...arguments)},P=function(e,t,n,r,o){e.style.gridRowStart=`${t+1}`,e.style.gridColumnStart=`${n+1}`,r?(e.classList.add("vertical"),e.style.gridRowEnd=`span ${o}`,e.style.gridColumnEnd="span 1"):(e.classList.remove("vertical"),e.style.gridRowEnd="span 1",e.style.gridColumnEnd=`span ${o}`)},k=function(e){return document.querySelector(`.drag-image[data-type="${e}"]`)},w=function(e,t){const n=document.createElement("div");n.dataset.type=`${e}`,n.classList.add("ship-container");for(let e=0;e<t;e++)n.appendChild(document.createElement("div"));!function(e,t,n){const r=e.cloneNode(!0);r.classList.add("drag-image"),P(r,0,0,!1,n),v.appendChild(r)}(n,0,t),n.draggable=!0,n.classList.add("planning-ship"),y.appendChild(n)},C=function(){return document.querySelector(".drag-image.active")},H=function(e){A(`${e}'s Turn`)},$=function(){p.name.value="",L.checked=!0,L.disabled=!1,b.disabled=!1,document.querySelectorAll(".ship-container").forEach((e=>{e.remove()}))},O=function(){$();for(const e of Object.values(a))w(e.type,e.length)},D=function(e,t){A(""),function(){const e=[m,h];E(((t,n)=>{e.forEach((e=>{e.querySelector(`[data-row="${t}"][data-col="${n}"]`).classList="grid-cell"}))}))}(),$(),function(e,t){document.querySelector(".gameplay-wrapper").classList.add("active"),document.querySelector(".player-1.player-name").textContent=e,document.querySelector(".player-2.player-name").textContent=t}(e,t)},M=function(e){document.documentElement.className=e},V=function(e){document.querySelector(`#${e}`).classList.remove("invalid"),document.querySelector(`#${e} + .error`).textContent=""},R=function(e){return""!==document.querySelector(`#${e} + .error`).textContent},x=M,U=function(){const e=C();return e?e.dataset.type:null},j=k,z=function(){document.querySelector("#insertion-marker").classList.remove("active")},B=function(e,t,n,r,o){const a=`.planning-ship[data-type="${r}"]`,i=document.querySelector(a);v.querySelector(a)||v.appendChild(i),P(i,e,t,n,o),P(k(r),0,0,n,o)},W=function(e,t){A(`${t.getName()} wins!`),I(N("Play Again","play-again")),T(e,t)};let K,F,Y=!1,X=!0;const _=function(e){return e?K:F},G=function(e,t,n){const r=_(X);e.receiveAttack(t,n);const o=e.getTileInfo(t,n);if(function(e,t,n,r){(r?h:m).querySelector(`[data-row="${e}"][data-col="${t}"]`).classList.add(n===i.HIT?"hit-cell":"miss-cell")}(t,n,o,X),o===i.HIT&&e.getShip(t,n).isSunk()){const r=e.getShip(t,n),o=e.getInitialPosition(r.getType());!function(e,t,n,r,o){const a=q(e);for(let e=0;e<o;e++){const o=r?t+e:t,i=r?n:n+e,c=a.querySelector(`[data-row="${o}"][data-col="${i}"]`);c.classList.add("sunken"),c.classList.remove("hit-cell")}}(!X,o.row,o.col,o.isVertical,r.getLength())}e.isFleetSunk()&&(W(X,r),Y=!1),X=!X},J=function(e,t){let n=l(10),r=l(10),o=0===l(2);for(;!e.isValidPlacement(t,n,r,o);)n=l(10),r=l(10),o=0===l(2);e.setShip(t,n,r,o),B(n,r,o,t.getType(),t.getLength())},Q=e=>{for(const t of Object.values(a))J(e,f(t.type))},Z=function(e){const t=e.currentTarget.classList.contains("player-1"),n=e.target.dataset.row,o=e.target.dataset.col,a=F.getType()===r.COMPUTER;if(t&&a||t===X||!Y)return;const c=_(t);if(c.getTileInfo(n,o)===i.UNKNOWN&&(G(c,n,o),Y))if(a){const[e,t]=F.getComputerAttack(K.getInfoBoard());G(K,e,t);const n=K.getShip(e,t);F.updateLastAttack(e,t,n&&n.isSunk(),K.getInfoBoard())}else{const e=_(!X);l=!X,s=e,u=c.getName(),document.querySelector(".ready").disabled=!1,document.querySelector(".concede").disabled=!0,H(u),function(e,t){const n=q(e);E(((e,r)=>{const o=n.querySelector(`[data-row="${e}"][data-col="${r}"]`);t.getShip(e,r)&&o.classList.remove("ship-cell")}))}(l,s),Y=!1}var l,s,u},ee=function(){const e=_(X);e.removeAllShips(),Q(e),R(c.SHIPS)&&V(c.SHIPS)},te=function(){O(),g.showModal(),K=u("Player",r.HUMAN),F=void 0,X=!0},ne=function(e){const t=e.target,{offsetX:n,offsetY:r}=function(e){const t=e.classList.contains("vertical"),n=t?2:2*Number(e.childElementCount),r=t?2*Number(e.childElementCount):2;return{offsetX:Number(e.offsetWidth)/n,offsetY:Number(e.offsetHeight)/r}}(t),o=j(t.dataset.type);e.dataTransfer.setData("text/plain",t.dataset.type),e.dataTransfer.setDragImage(o,n,r),e.dataTransfer.dropEffect="move",setTimeout((()=>{!function(e,t){!function(e){const t=e.cloneNode(!0);t.id="insertion-marker",t.draggable=!1,t.classList.remove("planning-ship"),v.appendChild(t)}(e),t.classList.add("active")}(t,o)}),0)},re=function(){document.querySelector("#insertion-marker").remove(),C().classList.remove("active")},oe=function(e){U()&&(e.preventDefault(),e.dataTransfer.dropEffect="move")},ae=function(){U()&&z()},ie=function(n){const r=U();if(!r)return;n.preventDefault(),n.dataTransfer.dropEffect="move";const o=_(X),a=Number(n.target.dataset.row),i=Number(n.target.dataset.col),c=o.getInitialPosition(r);let l,s;c?(l=o.getShip(c.row,c.col),s=c.isVertical):(l=f(r),s=!1);!function(n,r,o,a,i){const c=document.querySelector("#insertion-marker");c.classList.add("active");const l=window.getComputedStyle(c),s=Number(l.gridRowStart),u=Number(l.gridColumnStart),d=n+(i?a:1)+1,f=r+(i?1:a)+1;!function(n,r,o,a,i){const c=r?o:a,l=r?e+1:t+1,s=c>l?i-(c-l):i,u=[];for(let e=0;e<s;e++)u.push(document.createElement("div"));n.replaceChildren(...u)}(c,i,d,f,a),n!==s-1&&(c.style.gridRow=`${n+1} / ${Math.min(d,e+1)}`),r!==u-1&&(c.style.gridColumn=`${r+1} / ${Math.min(f,t+1)}`),o?c.classList.remove("invalid"):c.classList.add("invalid")}(a,i,o.isValidPlacement(l,a,i,s),l.getLength(),s)},ce=function(){U()&&z()},le=function(e){const t=e.dataTransfer.getData("text/plain");if(!n.includes(t))return;e.preventDefault();const r=_(X),o=r.getInitialPosition(t),a=Number(e.target.dataset.row),i=Number(e.target.dataset.col);let l,s;o?(l=r.getShip(o.row,o.col),s=o.isVertical):(l=f(t),s=!1),r.isValidPlacement(l,a,i,s)&&(o&&r.removeShip(o.row,o.col),r.setShip(l,a,i,s),B(a,i,s,l.getType(),l.getLength()),5===r.getAllShips().length&&R(c.SHIPS)&&V(c.SHIPS))},se=function(e){const t=e.dataTransfer.getData("text/plain");if(!n.includes(t))return;e.preventDefault();const r=_(X),o=r.getInitialPosition(t);if(o){const e=f(t);r.removeShip(o.row,o.col),function(e,t){const n=`.planning-ship[data-type="${e}"]`,r=document.querySelector(n);y.querySelector(n)||y.appendChild(r),r.classList.remove("vertical"),r.style.gridArea="",P(C(),0,0,!1,t)}(e.getType(),e.getLength())}},ue=function(e){const t=e.target.dataset.type,n=_(X),{row:r,col:o,isVertical:a}=n.getInitialPosition(t),i=n.getShip(r,o);n.isValidPlacement(i,r,o,!a)&&(n.removeShip(r,o),n.setShip(i,r,o,!a),B(r,o,!a,i.getType(),i.getLength()))},de=function(n){const{name:o,opponent:a}={name:p.name.value,opponent:p.opponent.value},c=_(X);var d;p.name.validity.valid&&""!==p.opponent.value&&5===c.getAllShips().length?(c.setName(o),"computer"===a?(Y=!0,F=function(){const n=u("Computer",r.COMPUTER);let o=[];const a=function(n,r){return n>=0&&n<e&&r>=0&&r<t};return{...n,getComputerAttack:function(e){const t=function(e){for(;o.length>0;){const[t,n]=o.pop();if(e[t][n]===i.UNKNOWN)return[t,n]}return null}(e);return t||function(e){let t=l(10),n=l(10);for(;e[t][n]!==i.UNKNOWN;)t=l(10),n=l(10);return[t,n]}(e)},updateLastAttack:function(e,t,n,r){if(n)o=[];else if(r[e][t]===i.HIT){const n=function(e,t,n){const r=s([[0,1],[1,0],[-1,0],[0,-1]]),o=[];for(const[c,l]of r){const r=e+c,s=t+l;if(a(r,s)&&n[r][s]===i.UNKNOWN){const u=e-c,d=t-l;a(u,d)&&n[u][d]===i.HIT?o.push([r,s]):o.unshift([r,s])}}return o}(e,t,r);o.push(...n)}else o=s(o)}}}(),Q(F),function(e,t,n){D(t,n),T(!0,e),I(N("Concede","concede"))}(K,K.getName(),F.getName())):(X=!X,F?function(e,t){D(e,t);const n=N("Concede","concede");n.disabled=!0,I(N("Ready","ready"),n),H(e)}(K.getName(),F.getName()):(F=u("Player",r.HUMAN),O(),b.checked=!0,L.disabled=!0,b.disabled=!0,n.preventDefault()))):(d=5!==c.getAllShips().length,p.name.validity.valueMissing&&(p.name.classList.add("invalid"),document.querySelector("#name + .error").textContent="Please fill in required field."),""===p.opponent.value&&(document.querySelector("fieldset + .error").textContent="Please fill in required field."),d&&(y.classList.add("invalid"),document.querySelector("#planning-ships + .error").textContent="Please place all ships onto the board."),n.preventDefault())},fe=function(){R(c.NAME)&&V(c.NAME)},ge=function(){R(c.OPPONENT)&&V(c.OPPONENT)},pe=function(){const e=_(X);(function(e,t){document.querySelector(".ready").disabled=!0,document.querySelector(".concede").disabled=!1,A(`Waiting for ${t.getName()} to attack...`),T(e,t)})(X,e),Y=!0},me=function(){const e=document.querySelector("#dark-mode").checked?"dark":"light";x(e),localStorage.setItem("theme",e)},he=function(){g.close()},Se=function(){const e=_(!X);W(!X,e),Y=!1};!function(){var e,t;t={receiveAttack:Z,rotate:ue},[m,h].forEach((e=>{e.addEventListener("click",(e=>{e.target.classList.contains("grid-cell")&&t.receiveAttack(e)}))})),v.addEventListener("click",(e=>{e.target.classList.contains("ship-container")&&t.rotate(e)})),function(e){S.addEventListener("click",(t=>{t.target.classList.contains("start-game")||t.target.classList.contains("play-again")?e.start():t.target.classList.contains("ready")?e.ready():t.target.classList.contains("concede")&&e.concede()}))}({start:te,ready:pe,concede:Se}),function(e){y.addEventListener("dragover",e.shipsDragoverHandler),v.addEventListener("dragleave",e.dragleaveHandler),v.addEventListener("dragover",(t=>{t.target.classList.contains("gameboard")?e.gapDragoverHandler():t.target.classList.contains("grid-cell")&&e.gridCellDragoverHandler(t)})),g.addEventListener("dragstart",(t=>{"DIV"===t.target.tagName&&t.target.classList.contains("ship-container")&&e.dragstartHandler(t)})),g.addEventListener("dragend",(t=>{"DIV"===t.target.tagName&&t.target.classList.contains("ship-container")&&e.dragendHandler()})),g.addEventListener("drop",(t=>{t.target.classList.contains("grid-cell")?e.boardDropHandler(t):t.target.id===`${c.SHIPS}`&&e.shipsDropHandler(t)}))}({dragstartHandler:ne,dragendHandler:re,gapDragoverHandler:ae,gridCellDragoverHandler:ie,boardDropHandler:le,shipsDropHandler:se,dragleaveHandler:ce,shipsDragoverHandler:oe}),function(e){g.addEventListener("submit",(t=>{e.submit(t)})),g.addEventListener("click",(t=>{t.target.classList.contains("randomize")?e.randomize():t.target.classList.contains("close")&&e.close()}))}({randomize:ee,submit:de,close:he}),e=fe,document.querySelector(`#${c.NAME}`).addEventListener("input",e),function(e){document.querySelector(`#${c.OPPONENT}`).addEventListener("change",e)}(ge),function(e){document.querySelector("#dark-mode").addEventListener("change",e)}(me);const n=localStorage.getItem("theme");n?"dark"===n&&(document.querySelector("#dark-mode").checked=!0,M("dark")):localStorage.setItem("theme","light")}()})();
//# sourceMappingURL=main.b242e2c7c794422625c5.js.map
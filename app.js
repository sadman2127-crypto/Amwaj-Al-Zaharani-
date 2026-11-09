import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);
const $ = id => document.getElementById(id);
const roomNumbers = Array.from({length:67},(_,i)=> i<14?101+i : i<28?201+i-14 : i<42?301+i-28 : i<56?401+i-42 : 501+i-56);
let roomsData = {}, selectedFloor=1, selectedRoom=null, admin=false, unsub=null, arabic=false;
const floors = [roomNumbers.slice(0,14),roomNumbers.slice(14,28),roomNumbers.slice(28,42),roomNumbers.slice(42,56),roomNumbers.slice(56)];
$("loginBtn").onclick = async()=>{ $("loginMsg").textContent="Signing in..."; try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);$("loginMsg").textContent="";}catch(e){$("loginMsg").textContent=e.message;} };
$("logoutBtn").onclick=()=>signOut(auth);
$("langBtn").onclick=()=>{arabic=!arabic;$("langBtn").textContent=arabic?"English":"العربية";render();};
$("totalPay").oninput=$("paid").oninput=()=> $("remaining").textContent=Math.max(0,(+ $("totalPay").value||0)-(+ $("paid").value||0));
$("saveBtn").onclick=async()=>{
 if(!admin||!selectedRoom)return;
 const total=+$("totalPay").value||0, paid=+$("paid").value||0;
 roomsData[selectedRoom]={status:$("status").value,guest:$("guest").value,idno:$("idno").value,mobile:$("mobile").value,total,paid,remaining:Math.max(0,total-paid)};
 try{await setDoc(doc(db,"hotel","rooms"),roomsData);$("saveMsg").textContent="Saved";}catch(e){$("saveMsg").textContent=e.message;}
};
$("clearBtn").onclick=()=>{["guest","idno","mobile","totalPay","paid"].forEach(id=>$(id).value="");$("status").value="available";$("remaining").textContent="0";};
function render(){
 const entries=Object.values(roomsData), occupied=entries.filter(x=>x.status==="occupied").length;
 $("total").textContent="67";$("full").textContent=occupied;$("empty").textContent=67-occupied;
 $("floors").innerHTML="";
 floors.forEach((_,i)=>{const b=document.createElement("button");b.className=i+1===selectedFloor?"":"secondary";b.textContent=arabic?`الطابق ${i+1}`:`Floor ${i+1}`;b.onclick=()=>{selectedFloor=i+1;selectedRoom=null;$("editor").classList.add("hidden");render();};$("floors").append(b);});
 $("floorTitle").textContent=arabic?`الطابق ${selectedFloor}`:`Floor ${selectedFloor}`;
 $("rooms").innerHTML="";
 floors[selectedFloor-1].forEach(n=>{const d=roomsData[n]||{},b=document.createElement("button");b.className="room "+(d.status==="occupied"?"full":"empty");b.innerHTML=`<b>${n}</b><br><span class="small">${d.status==="occupied"?(arabic?"مشغولة":"Occupied"):(arabic?"متاحة":"Available")}</span>`;b.onclick=()=>select(n);$("rooms").append(b);});
}
function select(n){selectedRoom=n;const d=roomsData[n]||{};$("editor").classList.toggle("hidden",!admin);$("editTitle").textContent=`Room ${n}`;$("status").value=d.status||"available";$("guest").value=d.guest||"";$("idno").value=d.idno||"";$("mobile").value=d.mobile||"";$("totalPay").value=d.total||"";$("paid").value=d.paid||"";$("remaining").textContent=d.remaining||0;}
onAuthStateChanged(auth,async user=>{
 if(unsub){unsub();unsub=null;}
 $("login").classList.toggle("hidden",!!user);$("app").classList.toggle("hidden",!user);
 if(!user)return;
 $("who").textContent=user.email||"Signed in";
 try{const snap=await (await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js")).getDoc(doc(db,"settings","admin"));admin=snap.exists()&&snap.data().uid===user.uid;}catch(e){admin=false;}
 $("role").textContent=admin?"Administrator / Admin":"View only / عرض فقط";
 $("editor").classList.add("hidden");
 unsub=onSnapshot(doc(db,"hotel","rooms"),s=>{roomsData=s.exists()?s.data():{};render();},e=>{$("saveMsg").textContent=e.message;});
});
render();
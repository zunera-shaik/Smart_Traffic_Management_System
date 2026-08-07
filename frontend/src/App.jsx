import { useState, useEffect, useRef, useCallback } from "react";

const API = "https://smart-traffic-management-system-5r2w.onrender.com/api";


// ---------- Helpers ----------

const getStateColor = (state) => {
  if (state === "HIGH") return "#ef4444";
  if (state === "MEDIUM") return "#f59e0b";
  return "#22c55e";
};


const getStateGlow = (state) => {
  if (state === "HIGH")
    return "0 0 20px #ef444466";

  if (state === "MEDIUM")
    return "0 0 20px #f59e0b66";

  return "0 0 20px #22c55e66";
};



// ---------- Animated Road ----------

function AnimatedRoad({
  road,
  traffic,
  signal,
  prediction,
  emergency
}) {

  const canvasRef = useRef(null);
  const vehiclesRef = useRef([]);
  const animationRef = useRef(null);


  const vehicles = traffic?.vehicles ?? 0;

  const state = traffic?.state ?? "LOW";

  const currentSignal =
    signal?.signal ?? "RED";


  const greenTime =
    signal?.green_time ?? 0;


  const predicted =
    prediction?.predicted ?? vehicles;


  const trend =
    prediction?.trend ?? "STABLE";


  const isEmergency = emergency;



  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;


    while (
      vehiclesRef.current.length <
      Math.min(vehicles,18)
    ) {

      vehiclesRef.current.push({

        x: Math.random()*420,

        y:20+Math.random()*80,

        speed:
        0.5+Math.random(),

        width:20,

        height:10,

        lane:
        Math.floor(Math.random()*3)

      });

    }


    while(
      vehiclesRef.current.length >
      Math.min(vehicles,18)
    ){

      vehiclesRef.current.pop();

    }


  },[vehicles]);





  useEffect(()=>{


    const canvas =
      canvasRef.current;


    if(!canvas) return;


    const ctx =
      canvas.getContext("2d");


    const width =
      canvas.width;


    const height =
      canvas.height;



    const draw=()=>{


      ctx.clearRect(
        0,
        0,
        width,
        height
      );



      // Road

      ctx.fillStyle="#1e293b";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );



      // lanes

      ctx.strokeStyle=
      "rgba(255,255,255,0.15)";


      ctx.setLineDash(
        [10,10]
      );


      ctx.beginPath();


      ctx.moveTo(
        0,
        height/3
      );


      ctx.lineTo(
        width,
        height/3
      );


      ctx.moveTo(
        0,
        height*2/3
      );


      ctx.lineTo(
        width,
        height*2/3
      );


      ctx.stroke();


      ctx.setLineDash([]);



      const moving =
        currentSignal==="GREEN"
        || isEmergency;


      vehiclesRef.current.forEach(v=>{


        v.x +=
        v.speed *
        (moving ? 1 : 0.1);



        if(v.x>width)
          v.x=-30;



        ctx.fillStyle="#60a5fa";


        ctx.fillRect(
          v.x,
          v.y,
          v.width,
          v.height
        );


      });



      animationRef.current =
      requestAnimationFrame(draw);


    };


    draw();


    return()=>{

      cancelAnimationFrame(
        animationRef.current
      );

    };


  },[
    currentSignal,
    isEmergency
  ]);



  return (

<div

style={{

background:"#0f172a",

borderRadius:16,

overflow:"hidden",

border:
`1px solid ${
isEmergency
?"#ef4444"
:"rgba(255,255,255,0.1)"
}`

}}

>


<div

style={{

padding:15,

display:"flex",

justifyContent:"space-between"

}}

>


<strong>

{road}

</strong>


<span

style={{

color:getStateColor(state)

}}

>

{state}

</span>


</div>



<canvas

ref={canvasRef}

width="420"

height="120"

style={{

width:"100%"

}}

/>



<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(4,1fr)",

padding:12

}}

>


<div>

<h3>{vehicles}</h3>

<small>
Vehicles
</small>

</div>


<div>

<h3>
{
greenTime===999
?"∞"
:`${greenTime}s`
}
</h3>

<small>
Green
</small>

</div>


<div>

<h3>
{predicted}
</h3>

<small>
Prediction
</small>

</div>


<div>

<h3>
{Math.round(vehicles)}
</h3>

<small>
Density
</small>

</div>


</div>


</div>


  );

}
// ---------- Mini Chart ----------

function MiniChart({ history }) {

  if (!history || history.length < 2)
    return null;


  const max =
    Math.max(...history,1);


  const points =
    history.map((v,i)=>{

      const x =
        (i/(history.length-1))*120;


      const y =
        40-(v/max)*40;


      return `${x},${y}`;

    });



  return (

<svg width="120" height="40">

<polyline

points={points.join(" ")}

fill="none"

stroke="#22c55e"

strokeWidth="2"

/>

</svg>

  );

}



// ---------- Emergency Panel ----------


function EmergencyPanel({
  emergency,
  onTrigger,
  onClear
}) {


const [road,setRoad] =
useState("Road1");



return (

<div

style={{

background:
"rgba(255,255,255,0.03)",

borderRadius:14,

padding:20

}}

>


<h3>
🚑 Emergency Control
</h3>


<select

value={road}

onChange={
e=>setRoad(e.target.value)
}

style={{

padding:8,

marginTop:15,

marginRight:10

}}

>


<option>
Road1
</option>

<option>
Road2
</option>

<option>
Road3
</option>


</select>



<button

onClick={()=>onTrigger(road)}

style={{

background:"#dc2626",

color:"white",

border:"none",

padding:"8px 15px",

borderRadius:8

}}

>

Trigger

</button>



{

emergency?.active &&

<button

onClick={onClear}

style={{

display:"block",

marginTop:15,

padding:8

}}

>

Clear Emergency

</button>

}


</div>

);


}





// ---------- Event Log ----------


function EventLog({events}){


return (

<div

style={{

background:
"rgba(255,255,255,0.03)",

padding:20,

borderRadius:14

}}

>


<h3>
📋 Events
</h3>



{

events.length===0

?

<p>No events</p>


:

events.map((e,i)=>(


<div

key={i}

style={{

marginTop:8

}}

>


{e.type}

&nbsp; -

&nbsp;

{e.road}


</div>


))


}


</div>


);


}





// ---------- Summary ----------


function SummaryStats({traffic}){


const roads =
Object.values(traffic);


if(!roads.length)
return null;



const total =
roads.reduce(
(sum,r)=>
sum+r.vehicles,
0
);



const avg =
Math.round(
total/roads.length
);



return (

<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(3,1fr)",

gap:15,

marginBottom:20

}}

>


<div className="card">

<h2>
{total}
</h2>

<p>
Total Vehicles
</p>

</div>


<div className="card">

<h2>
{avg}
</h2>

<p>
Average Density
</p>

</div>



<div className="card">

<h2>

{
Object.entries(traffic)
.sort(
(a,b)=>
b[1].vehicles-a[1].vehicles
)[0]?.[0] || "-"
}

</h2>


<p>
Busiest Road
</p>

</div>



</div>


);

}





// ---------- Main App ----------


export default function App(){


const [traffic,setTraffic]
=
useState({});


const [signals,setSignals]
=
useState({});


const [predictions,setPredictions]
=
useState({});


const [emergency,setEmergency]
=
useState({});


const [events,setEvents]
=
useState([]);


const [connected,setConnected]
=
useState(false);



const history =
useRef({

Road1:[],
Road2:[],
Road3:[]

});





const fetchData =
useCallback(async()=>{


try{


const [

trafficRes,

signalRes,

predictionRes,

emergencyRes,

eventRes

]
=
await Promise.all([


fetch(
`${API}/traffic`
)
.then(r=>r.json()),



fetch(
`${API}/signals`
)
.then(r=>r.json()),



fetch(
`${API}/predictions`
)
.then(r=>r.json()),



fetch(
`${API}/emergency/status`
)
.then(r=>r.json()),



fetch(
`${API}/events`
)
.then(r=>r.json())


]);



setTraffic(
trafficRes.data || {}
);



setSignals(
signalRes.signals || {}
);



setPredictions(
predictionRes.predictions || {}
);



setEmergency(
emergencyRes
);



setEvents(
Array.isArray(eventRes)
?
eventRes
:
[]
);



setConnected(true);



}

catch(error){

console.log(error);

setConnected(false);

}



},[]);





useEffect(()=>{


fetchData();


const timer =
setInterval(
fetchData,
4000
);



return()=>clearInterval(timer);


},[fetchData]);





const triggerEmergency =
async(road)=>{


await fetch(

`${API}/emergency/trigger`,

{

method:"POST",

headers:{

"Content-Type":
"application/json"

},

body:

JSON.stringify({
road
})

}

);



fetchData();


};





const clearEmergency =
async()=>{


await fetch(

`${API}/emergency/clear`,

{

method:"POST"

}

);



fetchData();


};
const roads = [
  "Road1",
  "Road2",
  "Road3"
];


return (

<div

style={{

minHeight:"100vh",

background:"#060d1a",

color:"#f8fafc",

fontFamily:"Segoe UI, sans-serif",

padding:25

}}

>


<style>

{`

.card{

background:
rgba(255,255,255,0.05);

padding:20px;

border-radius:14px;

border:
1px solid rgba(255,255,255,0.1);

}


button:hover{

opacity:0.8;

cursor:pointer;

}


`}

</style>





{/* Header */}


<div

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

marginBottom:25

}}

>


<div>


<h1>

🚦 Smart Traffic Management System

</h1>


<p

style={{

color:"#94a3b8"

}}

>

AI Traffic Simulation Dashboard

</p>


</div>



<div

style={{

padding:"8px 15px",

borderRadius:20,

background:

connected

?

"rgba(34,197,94,.2)"

:

"rgba(239,68,68,.2)",


color:

connected

?

"#22c55e"

:

"#ef4444"

}}

>


●

&nbsp;

{

connected

?

"Backend Connected"

:

"Backend Offline"

}


</div>



</div>





{/* Summary */}


<SummaryStats

traffic={traffic}

/>





{/* Roads */}


<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(3,1fr)",

gap:20,

marginBottom:25

}}

>


{

roads.map(
road=>(


<AnimatedRoad

key={road}

road={road}

traffic={traffic[road]}

signal={signals[road]}

prediction={predictions[road]}

emergency={
emergency?.active &&
emergency?.road===road
}

/>


)

)

}


</div>







{/* History Charts */}


<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(3,1fr)",

gap:20,

marginBottom:25

}}

>


{

roads.map(
road=>(


<div

key={road}

className="card"

>


<h4>

{road} Traffic History

</h4>


<MiniChart

history={
history.current[road]
}

/>


</div>


)

)

}


</div>








{/* Controls */}


<div

style={{

display:"grid",

gridTemplateColumns:

"1fr 1fr",

gap:20

}}

>


<EmergencyPanel

emergency={emergency}

onTrigger={triggerEmergency}

onClear={clearEmergency}

/>



<EventLog

events={events}

/>



</div>






<p

style={{

textAlign:"center",

marginTop:30,

color:"#64748b",

fontSize:12

}}

>


Updates every 4 seconds

</p>



</div>


);


}
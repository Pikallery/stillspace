'use client'
import { useState } from 'react'

const QUOTES = [
  {
    text: "Courage doesn't mean you don't get afraid. Courage means you don't let fear stop you.",
    author: 'Bethany Hamilton',
  },
  {
    text: 'Even the darkest night will end and the sun will rise.',
    author: 'Victor Hugo',
  },
  {
    text: "Take a deep breath. It's just a bad day, not a bad life.",
    author: '',
  },
  {
    text: 'You are allowed to be both a masterpiece and a work in progress simultaneously.',
    author: 'Sophia Bush',
  },
  {
    text: "You don't have to be positive all the time. Having feelings doesn't make you negative — it makes you human.",
    author: 'Lori Deschene',
  },
]

// ── 1. Parachute ─────────────────────────────────────────────────────────────

function ParachuteAnim() {
  return (
    <>
      <style>{`
        .pl-wrap{width:240px;height:240px;position:relative;overflow:hidden;border-radius:16px}
        .pl-wind{position:absolute;width:2px;background:rgba(255,255,255,.5);border-radius:2px;bottom:-50px;animation:plWind .8s linear infinite}
        .pl-w1{left:20%;height:40px;animation-duration:.5s}
        .pl-w2{left:80%;height:60px;animation-delay:.2s;animation-duration:.7s}
        .pl-w3{left:10%;height:30px;animation-delay:.4s;animation-duration:.6s}
        .pl-w4{left:90%;height:50px;animation-delay:.1s;animation-duration:.8s}
        .pl-w5{left:50%;height:25px;animation-delay:.5s;animation-duration:.4s}
        .pl-cloud{position:absolute;background:#fff;border-radius:50%;bottom:-100px;opacity:.8;animation:plCloud 3s linear infinite}
        .pl-cloud::after,.pl-cloud::before{content:'';position:absolute;background:inherit;border-radius:50%}
        .pl-c1{width:60px;height:60px;left:10%;animation-duration:2.5s}
        .pl-c1::after{width:40px;height:40px;top:-20px;left:10px}
        .pl-c1::before{width:50px;height:50px;top:-10px;left:30px}
        .pl-c2{width:80px;height:80px;right:15%;animation-duration:3.2s;animation-delay:1s;opacity:.6}
        .pl-c2::after{width:50px;height:50px;top:-25px;left:15px}
        .pl-c2::before{width:60px;height:60px;top:-15px;left:40px}
        .pl-fig{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100px;height:120px;animation:plSway 3s ease-in-out infinite;z-index:10}
        .pl-fig svg{width:100%;height:100%;display:block;filter:drop-shadow(0 10px 10px rgba(0,0,0,.2))}
        @keyframes plWind{0%{bottom:-60px;opacity:0}50%{opacity:1}100%{bottom:300px;opacity:0}}
        @keyframes plCloud{0%{bottom:-100px;opacity:0}20%{opacity:.9}80%{opacity:.9}100%{bottom:350px;opacity:0}}
        @keyframes plSway{0%,100%{transform:translate(-50%,-50%) rotate(-5deg)}50%{transform:translate(-50%,-45%) rotate(5deg)}}
      `}</style>
      <div className="pl-wrap">
        <div className="pl-wind pl-w1" /><div className="pl-wind pl-w2" />
        <div className="pl-wind pl-w3" /><div className="pl-wind pl-w4" /><div className="pl-wind pl-w5" />
        <div className="pl-cloud pl-c1" /><div className="pl-cloud pl-c2" />
        <div className="pl-fig">
          <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <line x1="10" y1="40" x2="45" y2="80" stroke="#eee" strokeWidth="2" />
            <line x1="90" y1="40" x2="55" y2="80" stroke="#eee" strokeWidth="2" />
            <line x1="50" y1="35" x2="50" y2="80" stroke="#eee" strokeWidth="2" />
            <path d="M 10 40 Q 50 -10 90 40 Z" fill="#FF6B6B" />
            <path d="M 30 28 Q 50 0 70 28 L 50 35 Z" fill="#FFFFFF" opacity="0.3" />
            <circle cx="50" cy="85" r="8" fill="#FFFFFF" />
            <rect x="42" y="93" width="16" height="20" rx="5" fill="#1E90FF" />
            <path d="M 42 95 L 30 85" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            <path d="M 58 95 L 70 85" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            <path d="M 45 113 L 40 120" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            <path d="M 55 113 L 60 120" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </>
  )
}

// ── 2. Candle ─────────────────────────────────────────────────────────────────

function CandleAnim() {
  return (
    <>
      <style>{`
        .cv-scene{position:relative;width:220px;height:180px}
        .cv-floor{position:absolute;left:50%;top:70%;width:220px;height:5px;background:#673c63;transform:translate(-50%,-50%);box-shadow:0 2px 5px #111;z-index:2}
        .cv-candles{position:absolute;left:50%;top:50%;width:180px;height:130px;transform:translate(-50%,-90%);z-index:1}
        .candle1{position:absolute;left:50%;top:50%;width:35px;height:100px;background:#fff;border:3px solid #673c63;border-bottom:0;border-radius:3px;transform-origin:center right;transform:translate(60%,-25%);box-shadow:-2px 0 0 #95c6f2 inset;animation:expand-body 3s infinite linear}
        .candle1__stick,.candle2__stick{position:absolute;left:50%;top:0;width:3px;height:15px;background:#673c63;border-radius:8px;transform:translate(-50%,-100%)}
        .candle2__stick{height:12px;transform-origin:bottom center;animation:stick-animation 3s infinite linear}
        .candle1__eyes,.candle2__eyes{position:absolute;left:50%;top:0;width:35px;height:30px;transform:translate(-50%,0)}
        .candle1__eyes-one{position:absolute;left:30%;top:20%;width:5px;height:5px;border-radius:100%;background:#673c63;transform:translate(-70%,0);animation:blink-eyes 3s infinite linear}
        .candle1__eyes-two{position:absolute;left:70%;top:20%;width:5px;height:5px;border-radius:100%;background:#673c63;transform:translate(-70%,0);animation:blink-eyes 3s infinite linear}
        .candle1__mouth{position:absolute;left:40%;top:20%;width:0;height:0;border-radius:20px;background:#673c63;transform:translate(-50%,-50%);animation:uff 3s infinite linear}
        .candle__smoke-one{position:absolute;left:30%;top:50%;width:30px;height:3px;background:grey;transform:translate(-50%,-50%);animation:move-left 3s infinite linear}
        .candle__smoke-two{position:absolute;left:30%;top:40%;width:10px;height:10px;border-radius:10px;background:grey;transform:translate(-50%,-50%);animation:move-top 3s infinite linear}
        .candle2{position:absolute;left:20%;top:65%;width:42px;height:60px;background:#fff;border:3px solid #673c63;border-bottom:0;border-radius:3px;transform:translate(60%,-15%);transform-origin:center right;box-shadow:-2px 0 0 #95c6f2 inset;animation:shake-left 3s infinite linear}
        .candle2__eyes-one{position:absolute;left:30%;top:50%;width:5px;height:5px;display:inline-block;border-radius:100%;background:#673c63;transform:translate(-80%,0);animation:changeto-lower 3s infinite linear}
        .candle2__eyes-two{position:absolute;left:70%;top:50%;width:5px;height:5px;display:inline-block;border-radius:100%;background:#673c63;transform:translate(-80%,0);animation:changeto-greater 3s infinite linear}
        .cv-light__wave{position:absolute;top:35%;left:35%;width:75px;height:75px;border-radius:100%;z-index:0;transform:translate(-25%,-50%) scale(2.5,2.5);border:2px solid rgba(255,255,255,.2);animation:expand-light 3s infinite linear}
        .candle2__fire{position:absolute;top:50%;left:40%;display:block;width:16px;height:20px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#ff9800;transform:translate(-50%,-50%);animation:dance-fire 3s infinite linear}
        @keyframes blink-eyes{0%,35%{opacity:1;transform:translate(-70%,0)}36%,39%{opacity:0;transform:translate(-70%,0)}40%{opacity:1;transform:translate(-70%,0)}50%,65%{transform:translate(-140%,0)}66%{transform:translate(-70%,0)}}
        @keyframes expand-body{0%,40%{transform:scale(1,1) translate(60%,-25%)}45%,55%{transform:scale(1.1,1.1) translate(60%,-28%)}60%{transform:scale(.89,.89) translate(60%,-25%)}65%{transform:scale(1,1) translate(60%,-25%)}70%{transform:scale(.95,.95) translate(60%,-25%)}75%{transform:scale(1,1) translate(60%,-25%)}}
        @keyframes uff{0%,40%{width:0;height:0}50%,54%{width:15px;height:15px;left:30%}59%{width:5px;height:5px;left:20%}62%{width:2px;height:2px;left:20%}67%{width:0;height:0;left:30%}}
        @keyframes move-left{0%,59%,100%{width:0;left:40%}60%{width:30px;left:30%}68%{width:0;left:20%}}
        @keyframes move-top{0%,64%,100%{width:0;height:0;top:0}65%{width:10px;height:10px;top:40%;left:40%}80%{width:0;height:0;top:20%}}
        @keyframes shake-left{0%,40%{left:20%;transform:translate(60%,-15%)}50%,54%,59%{left:20%;transform:translate(60%,-15%)}62%{left:18%;transform:translate(60%,-15%)}65%{left:21%;transform:translate(60%,-15%)}67%{left:20%;transform:translate(60%,-15%)}75%{left:20%;transform:scale(1.15,.85) translate(60%,-15%);background:#fff;border-color:#673c63}91%{left:20%;transform:scale(1.18,.82) translate(60%,-10%);background:#f44336;border-color:#f44336;box-shadow:-2px 0 0 #f44336 inset}92%{left:20%;transform:scale(.85,1.15) translate(60%,-15%)}95%{left:20%;transform:scale(1.05,.95) translate(60%,-15%)}97%{left:20%;transform:scale(1,1) translate(60%,-15%)}}
        @keyframes stick-animation{0%,54%,59%{left:50%;top:0;transform:translate(-50%,-100%)}62%{transform:rotateZ(-15deg) translate(-50%,-100%)}65%{transform:rotateZ(15deg) translate(-50%,-100%)}70%{transform:rotateZ(-5deg) translate(-50%,-100%)}72%,84%{transform:rotateZ(0deg) translate(-50%,-100%)}85%{transform:rotateZ(180deg) translate(0%,120%)}92%{left:50%;top:0;transform:translate(-50%,-100%)}}
        @keyframes expand-light{10%,29%,59%,89%{transform:translate(-25%,-50%) scale(0,0);border:2px solid rgba(255,255,255,0)}90%,20%,50%{transform:translate(-25%,-50%) scale(1,1)}95%,96%,26%,27%,56%,57%{transform:translate(-25%,-50%) scale(2,2);border:2px solid rgba(255,255,255,.5)}0%,28%,58%,100%{transform:translate(-25%,-50%) scale(2.5,2.5);border:2px solid rgba(255,255,255,.2)}}
        @keyframes dance-fire{59%,89%{left:40%;width:0;height:0}90%,0%,7%,15%,23%,31%,39%,47%,55%{left:40.8%;width:16px;height:20px;background:#ffc107}94%,3%,11%,19%,27%,35%,43%,51%,58%{left:41.2%;width:16px;height:20px;background:#ff9800}}
        @keyframes changeto-lower{0%,70%,90%{padding:0;border-radius:100%;background:#673c63;border:0 solid #673c63;transform:translate(-90%,0)}71%,89%{background:none;border:solid #673c63;border-radius:0;border-width:0 2px 2px 0;padding:1px;transform:rotate(-45deg) translate(-50%,-65%)}}
        @keyframes changeto-greater{0%,70%,90%{top:50%;padding:0;border-radius:100%;background:#673c63;border:0 solid #673c63;transform:translate(-80%,0)}71%,89%{top:30%;background:none;border:solid #673c63;border-radius:0;border-width:0 2px 2px 0;padding:1px;transform:rotate(135deg) translate(-80%,20%)}}
      `}</style>
      <div className="cv-scene">
        <div className="cv-candles">
          <div className="cv-light__wave" />
          <div className="candle1">
            <div className="candle1__body">
              <div className="candle1__eyes">
                <span className="candle1__eyes-one" />
                <span className="candle1__eyes-two" />
              </div>
              <div className="candle1__mouth" />
            </div>
            <div className="candle1__stick" />
          </div>
          <div className="candle2">
            <div className="candle2__body">
              <div className="candle2__eyes">
                <div className="candle2__eyes-one" />
                <div className="candle2__eyes-two" />
              </div>
            </div>
            <div className="candle2__stick" />
          </div>
          <div className="candle2__fire" />
          <div className="candle__smoke-one" />
          <div className="candle__smoke-two" />
        </div>
        <div className="cv-floor" />
      </div>
    </>
  )
}

// ── 3. Capybara ───────────────────────────────────────────────────────────────

function CapybaraAnim() {
  return (
    <>
      <style>{`
        .capybaraloader{width:14em;height:10em;position:relative;z-index:1;--color:rgb(204,125,45);--color2:rgb(83,56,28);transform:scale(.75)}
        .capybara-body-wrap{width:100%;height:7.5em;position:relative;z-index:1}
        .capy-loader-bar{width:100%;height:2.5em;position:relative;z-index:1;overflow:hidden}
        .capy{width:85%;height:100%;background:linear-gradient(var(--color),90%,var(--color2));border-radius:45%;position:relative;z-index:1;animation:movebody 1s linear infinite}
        .capyhead{width:7.5em;height:7em;bottom:0;right:0;position:absolute;background-color:var(--color);z-index:3;border-radius:3.5em;box-shadow:-1em 0 var(--color2);animation:movebody 1s linear infinite}
        .capyear{width:2em;height:2em;background:linear-gradient(-45deg,var(--color),90%,var(--color2));top:0;left:0;border-radius:100%;position:absolute;overflow:hidden;z-index:3}
        .capyear:nth-child(2){left:5em;background:linear-gradient(25deg,var(--color),90%,var(--color2))}
        .capyear2{width:100%;height:1em;background-color:var(--color2);bottom:0;left:.5em;border-radius:100%;position:absolute;transform:rotate(-45deg)}
        .capymouth{width:3.5em;height:2em;background-color:var(--color2);position:absolute;bottom:0;left:2.5em;border-radius:50%;display:flex;justify-content:space-around;align-items:center;padding:.5em}
        .capylips{width:.25em;height:.75em;border-radius:100%;transform:rotate(-45deg);background-color:var(--color)}
        .capylips:nth-child(2){transform:rotate(45deg)}
        .capyeye{width:2em;height:.5em;background-color:var(--color2);position:absolute;bottom:3.5em;left:1.5em;border-radius:5em;transform:rotate(45deg)}
        .capyeye:nth-child(4){transform:rotate(-45deg);left:5.5em;width:1.75em}
        .capyleg{width:6em;height:5em;bottom:0;left:0;position:absolute;background:linear-gradient(var(--color),95%,var(--color2));z-index:2;border-radius:2em;animation:movebody 1s linear infinite}
        .capyleg2{width:1.75em;height:3em;bottom:0;left:3.25em;position:absolute;background:linear-gradient(var(--color),80%,var(--color2));z-index:2;border-radius:.75em;box-shadow:inset 0 -.5em var(--color2);animation:moveleg 1s linear infinite}
        .capyleg2:nth-child(3){width:1.25em;left:.5em;height:2em;animation:moveleg2 1s linear infinite .075s}
        .capy-loaderline{width:50em;height:.5em;border-top:.5em dashed var(--color2);animation:moveline 10s linear infinite}
        @keyframes moveleg{0%{transform:rotate(-45deg) translateX(-5%)}50%{transform:rotate(45deg) translateX(5%)}100%{transform:rotate(-45deg) translateX(-5%)}}
        @keyframes moveleg2{0%{transform:rotate(45deg)}50%{transform:rotate(-45deg)}100%{transform:rotate(45deg)}}
        @keyframes movebody{0%{transform:translateX(0)}50%{transform:translateX(2%)}100%{transform:translateX(0)}}
        @keyframes moveline{0%{transform:translateX(0);opacity:0}5%{opacity:100%}95%{opacity:100%}100%{opacity:0;transform:translateX(-70%)}}
      `}</style>
      <div className="capybaraloader">
        <div className="capybara-body-wrap">
          <div className="capyhead">
            <div className="capyear"><div className="capyear2" /></div>
            <div className="capyear" />
            <div className="capymouth">
              <div className="capylips" /><div className="capylips" />
            </div>
            <div className="capyeye" /><div className="capyeye" />
          </div>
          <div className="capyleg" />
          <div className="capyleg2" /><div className="capyleg2" />
          <div className="capy" />
        </div>
        <div className="capy-loader-bar">
          <div className="capy-loaderline" />
        </div>
      </div>
    </>
  )
}

// ── 4. Hamster Wheel ─────────────────────────────────────────────────────────

function HamsterAnim() {
  return (
    <>
      <style>{`
        .wah{--dur:1s;position:relative;width:12em;height:12em;font-size:14px}
        .hw-wheel,.hw-hamster,.hw-hamster div,.hw-spoke{position:absolute}
        .hw-wheel,.hw-spoke{border-radius:50%;top:0;left:0;width:100%;height:100%}
        .hw-wheel{background:radial-gradient(100% 100% at center,hsla(0,0%,60%,0) 47.8%,hsl(0,0%,60%) 48%);z-index:2}
        .hw-hamster{animation:hamster var(--dur) ease-in-out infinite;top:50%;left:calc(50% - 3.5em);width:7em;height:3.75em;transform:rotate(4deg) translate(-.8em,1.85em);transform-origin:50% 0;z-index:1}
        .hw-hamster__head{animation:hamsterHead var(--dur) ease-in-out infinite;background:hsl(30,90%,55%);border-radius:70% 30% 0 100%/40% 25% 25% 60%;box-shadow:0 -.25em 0 hsl(30,90%,80%) inset,.75em -1.55em 0 hsl(30,90%,90%) inset;top:0;left:-2em;width:2.75em;height:2.5em;transform-origin:100% 50%}
        .hw-hamster__ear{animation:hamsterEar var(--dur) ease-in-out infinite;background:hsl(0,90%,85%);border-radius:50%;box-shadow:-.25em 0 hsl(30,90%,55%) inset;top:-.25em;right:-.25em;width:.75em;height:.75em;transform-origin:50% 75%}
        .hw-hamster__eye{animation:hamsterEye var(--dur) linear infinite;background-color:hsl(0,0%,0%);border-radius:50%;top:.375em;left:1.25em;width:.5em;height:.5em}
        .hw-hamster__nose{background:hsl(0,90%,75%);border-radius:35% 65% 85% 15%/70% 50% 50% 30%;top:.75em;left:0;width:.2em;height:.25em}
        .hw-hamster__body{animation:hamsterBody var(--dur) ease-in-out infinite;background:hsl(30,90%,90%);border-radius:50% 30% 50% 30%/15% 60% 40% 40%;box-shadow:.1em .75em 0 hsl(30,90%,55%) inset,.15em -.5em 0 hsl(30,90%,80%) inset;top:.25em;left:2em;width:4.5em;height:3em;transform-origin:17% 50%;transform-style:preserve-3d}
        .hw-hamster__limb--fr,.hw-hamster__limb--fl{clip-path:polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);top:2em;left:.5em;width:1em;height:1.5em;transform-origin:50% 0}
        .hw-hamster__limb--fr{animation:hamsterFRLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,80%) 80%,hsl(0,90%,75%) 80%);transform:rotate(15deg) translateZ(-1px)}
        .hw-hamster__limb--fl{animation:hamsterFLLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,90%) 80%,hsl(0,90%,85%) 80%);transform:rotate(15deg)}
        .hw-hamster__limb--br,.hw-hamster__limb--bl{border-radius:.75em .75em 0 0;clip-path:polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);top:1em;left:2.8em;width:1.5em;height:2.5em;transform-origin:50% 30%}
        .hw-hamster__limb--br{animation:hamsterBRLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,80%) 90%,hsl(0,90%,75%) 90%);transform:rotate(-25deg) translateZ(-1px)}
        .hw-hamster__limb--bl{animation:hamsterBLLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,90%) 90%,hsl(0,90%,85%) 90%);transform:rotate(-25deg)}
        .hw-hamster__tail{animation:hamsterTail var(--dur) linear infinite;background:hsl(0,90%,85%);border-radius:.25em 50% 50% .25em;box-shadow:0 -.2em 0 hsl(0,90%,75%) inset;top:1.5em;right:-.5em;width:1em;height:.5em;transform:rotate(30deg) translateZ(-1px);transform-origin:.25em .25em}
        .hw-spoke{animation:spoke var(--dur) linear infinite;background:radial-gradient(100% 100% at center,hsl(0,0%,60%) 4.8%,hsla(0,0%,60%,0) 5%),linear-gradient(hsla(0,0%,55%,0) 46.9%,hsl(0,0%,65%) 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50%/99% 99% no-repeat}
        @keyframes hamster{from,to{transform:rotate(4deg) translate(-.8em,1.85em)}50%{transform:rotate(0) translate(-.8em,1.85em)}}
        @keyframes hamsterHead{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(8deg)}}
        @keyframes hamsterEye{from,90%,to{transform:scaleY(1)}95%{transform:scaleY(0)}}
        @keyframes hamsterEar{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(12deg)}}
        @keyframes hamsterBody{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-2deg)}}
        @keyframes hamsterFRLimb{from,25%,50%,75%,to{transform:rotate(50deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-30deg) translateZ(-1px)}}
        @keyframes hamsterFLLimb{from,25%,50%,75%,to{transform:rotate(-30deg)}12.5%,37.5%,62.5%,87.5%{transform:rotate(50deg)}}
        @keyframes hamsterBRLimb{from,25%,50%,75%,to{transform:rotate(-60deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(20deg) translateZ(-1px)}}
        @keyframes hamsterBLLimb{from,25%,50%,75%,to{transform:rotate(20deg)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-60deg)}}
        @keyframes hamsterTail{from,25%,50%,75%,to{transform:rotate(30deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(10deg) translateZ(-1px)}}
        @keyframes spoke{from{transform:rotate(0)}to{transform:rotate(-1turn)}}
      `}</style>
      <div className="wah" aria-label="Hamster running in a wheel" role="img">
        <div className="hw-wheel" />
        <div className="hw-hamster">
          <div className="hw-hamster__body">
            <div className="hw-hamster__head">
              <div className="hw-hamster__ear" />
              <div className="hw-hamster__eye" />
              <div className="hw-hamster__nose" />
            </div>
            <div className="hw-hamster__limb hw-hamster__limb--fr" />
            <div className="hw-hamster__limb hw-hamster__limb--fl" />
            <div className="hw-hamster__limb hw-hamster__limb--br" />
            <div className="hw-hamster__limb hw-hamster__limb--bl" />
            <div className="hw-hamster__tail" />
          </div>
        </div>
        <div className="hw-spoke" />
      </div>
    </>
  )
}

// ── 5. Breathing circle (custom, mindfulness-themed) ─────────────────────────

function BreathingAnim() {
  return (
    <>
      <style>{`
        .br-wrap{position:relative;width:180px;height:180px;display:flex;align-items:center;justify-content:center}
        .br-ring{position:absolute;border-radius:50%;border:2px solid rgba(139,92,246,.35);animation:brExpand 3.5s ease-out infinite}
        .br-ring:nth-child(2){animation-delay:1.15s}
        .br-ring:nth-child(3){animation-delay:2.3s}
        .br-core{width:64px;height:64px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.9),rgba(99,102,241,.4));animation:brPulse 3.5s ease-in-out infinite;box-shadow:0 0 30px rgba(139,92,246,.4)}
        .br-inner{position:absolute;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.25);animation:brPulse 3.5s ease-in-out infinite .4s}
        @keyframes brExpand{0%{width:64px;height:64px;opacity:.9}100%{width:180px;height:180px;opacity:0}}
        @keyframes brPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
      `}</style>
      <div className="br-wrap">
        <div className="br-ring" /><div className="br-ring" /><div className="br-ring" />
        <div className="br-core"><div className="br-inner" /></div>
      </div>
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

const ANIMS = [ParachuteAnim, CandleAnim, CapybaraAnim, HamsterAnim, BreathingAnim]

export function LoadingScreen() {
  const [idx] = useState(() => Math.floor(Math.random() * ANIMS.length))
  const Anim = ANIMS[idx]
  const quote = QUOTES[idx]

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-10
                    bg-gray-950">
      {/* Animation */}
      <div className="flex items-center justify-center">
        <Anim />
      </div>

      {/* Quote */}
      <div className="text-center max-w-xs px-6 space-y-2">
        <p className="text-gray-200 text-sm md:text-base italic leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        {quote.author && (
          <p className="text-gray-500 text-xs">— {quote.author}</p>
        )}
      </div>

      {/* Subtle loading dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-600"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

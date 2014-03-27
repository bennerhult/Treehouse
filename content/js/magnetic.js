Magnetic=new (function(){
    function z(a){
        var b=new Magnet
        b.position.x=a.x
        b.position.y=a.y
        magnets.push(b)
        a=b.position
       for(b=0; b<F; b++){
           var c=new Particle
           c.position.x=a.x
           c.position.y=a.y
           c.shift.x=a.x
           c.shift.y=a.y
          c.size = 1.5+Math.random()*3.5
           c.color=styles[0].particleFill
           particles.push(c)
       }
    }

    function G(a) {
        n=a.clientX-(window.innerWidth-i)*0.5
        o=a.clientY-(window.innerHeight-j)*0.5
    }

    function fire(a){
        a.preventDefault()
        drawMagnet(a)
    }

    function drawMagnet(event){
        w=true
        z({x: window.event.clientX  - getOffset(e).left,y: window.event.clientY - getOffset(e).top})
        x=(new Date).getTime()
        var magnet
        for(var a=0,b=magnets.length; a<b; a++){
            magnet=magnets[a]
            if(B(magnet.position,{x:n,y:o})<magnet.orbit*0.5){
                magnet.dragging=true
                break
            }
        }
    }

    function getOffset( el ) {
        var _x = 0
        var _y = 0
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft
            _y += el.offsetTop - el.scrollTop
            el = el.offsetParent
        }
        return { top: _y, left: _x }
    }

    function I(){
        w=false
        for(var a=0,b=magnets.length; a<b; a++){
            var magnet=f[a]
            magnet.dragging=false
        }
    }

    function M(){
        w=false
        for(var a=0,b=magnets.length; a<b; a++){
            var magnet=f[a]
            magnet.dragging=false}
    }

    function drawCanvas(){
        i = $("#web-menu").width()
        j= $("body").height()
        e.width=i
        e.height=j
        var a=(window.innerWidth-i)*0.5,
            b=(window.innerHeight-j)*0.5
        e.style.position="absolute"
        e.style.left=0+"px"
        e.style.top=0+"px"
    }

    var counter = 0
    function P(){
        d.clearRect(0,0,e.width,e.height)
        var a,b,c,h,D,u
        a=-1
        h=0
        //Draw magnets
        a!=-1&&magnets.length>1&&magnets.splice(a,1)
        c=0
        var minimized=[]
        for(D=particles.length; c<D; c++){
            a=particles[c]

            var y=-1,E=-1,l=null,v={x:0,y:0}
            h=0
            for(u=magnets.length; h<u; h++){
                b=magnets[h]
                y=B(a.position, b.position)-b.orbit*0.5
                if(a.magnet!=b){
                    var m=b.position.x-a.position.x
                    if(m>-p&&m<p)v.x+=m/p; m=b.position.y-a.position.y
                    if(m>-p&&m<p)v.y+=m/p}if(l==null||y<E){E=y
                    l=b
                }
            }
            if(a.magnet==null||a.magnet!=l)a.magnet=l
            l.connections+=1
            if (a.size > 0) {
                a.angle+=a.speed
                a.shift.x+=(l.position.x+v.x*6-a.shift.x)*a.speed
                a.shift.y+=(l.position.y+v.y*6-a.shift.y)*a.speed
                a.position.x=a.shift.x+Math.cos(c+a.angle)*a.orbit*a.force
                a.position.y=a.shift.y+Math.sin(c+a.angle)*a.orbit*a.force
                a.position.x=Math.max(Math.min(a.position.x,i-a.size/2),a.size/2)
                a.position.y=Math.max(Math.min(a.position.y,j-a.size/2),a.size/2)
                a.orbit+=(l.orbit-a.orbit)*0.1
                d.beginPath()
                d.fillStyle=a.color
                d.arc(a.position.x,a.position.y,a.size/2,0,Math.PI*2,true)
                d.fill()
            }

            if (a.size >= 0) {
                a.size -=  0.1
            } else {
                if (minimized.indexOf(a) == -1) {
                    minimized.push(a)
                }
                if (minimized.length >= particles.length) {
                    particles.splice(0)
                    magnets.splice(0)
                }
            }
        }
    }

    //test later
    function get_random_color() {
        var letters = '0123456789ABCDEF'.split('')
        var color = '#'
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.round(Math.random() * 15)]
        }
        return color
    }
    function B(a,b){
        var c=b.x-a.x,h=b.y-a.y
        return Math.sqrt(c*c+h*h)
    }

    var mobileClient=navigator.userAgent.toLowerCase().indexOf("android")!=-1||navigator.userAgent.toLowerCase().indexOf("iphone")!=-1||navigator.userAgent.toLowerCase().indexOf("ipad")!=-1,
        i=mobileClient?window.innerWidth:800,j=mobileClient?window.innerHeight:550,F=100,p=300,e,d,t,particles=[],magnets=[],n=window.innerWidth-i,o=window.innerHeight-j,w=false,x=0,styles=[{glowA:"rgba(233,143,154,0.3)",glowB:"rgba(0,143,154,0.0)",particleFill:"#ffffff",fadeFill:"rgba(22,22,22,.6)",useFade:false}]

    this.addFireListener = function (element)  {
        element.addEventListener("mousedown",fire,false)
    }

    this.init=function(){
        $("#world").css( 'pointer-events', 'none' )
        var els=document.body.getElementsByTagName("a")
        for(var i=0;i<els.length;i++){
            els[i].addEventListener("mousedown",fire,false)
        }
        e=document.getElementById("world")
        if(e&&e.getContext){
            d=e.getContext("2d")
            if(mobileClient) e.style.border="none"
            window.addEventListener("resize",drawCanvas,false)
            drawCanvas()
            setInterval(P,1E3/30)
        }
   }
})

function Particle(){
    this.size=1.5+Math.random()*3.5
    this.position={x:0,y:0}
    this.shift={x:0,y:0}
    this.angle=0
    this.speed=0.06+this.size/4*0.03
    this.force=0.3-Math.random()*0.11
    this.color="#ffffff"
    this.orbit=0.2
    this.magnet=null
}

function Magnet(){
    this.orbit=100
    this.position={x:0,y:0}
    this.dragging=false
    this.connections=0
    this.size=1
}
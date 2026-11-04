import {webFiles} from './model';
import {turtleStarter} from './turtle-starter';

export type Starter={
 id:string;
 name:string;
 type:'web'|'python'|'java'|'cpp'|'c';
 category:string;
 description:string;
 level:string;
 time:string;
 tagline:string;
 files:Record<string,string>;
};

export const starters:Starter[]=[
 {id:'turtle',name:'Draw outside the lines',type:'python',category:'Turtle graphics',description:'Turn a few lines of Python into your own generative artwork.',level:'First steps',time:'15 min',tagline:'Turn a loop into a five-point star.',files:{'main.py':turtleStarter}},
 {id:'web',name:'A website that’s all you',type:'web',category:'Web development',description:'Build a little corner of the internet. Make it unmistakably yours.',level:'First steps',time:'20 min',tagline:'Shape a page with HTML, CSS, and a little JavaScript.',files:{...webFiles}},
 {id:'python',name:'Hello, Python. Hello, possibility.',type:'python',category:'Python',description:'Meet variables, loops, and the joy of making something work.',level:'First steps',time:'10 min',tagline:'Change one name and make the greeting your own.',files:{'main.py':'# A little introduction, written by you.\nname = "curious coder"\nprint(f"Hello, {name}!")\n\n# What happens if you change the number?\nfor step in range(1, 6):\n    print("*" * step)\n'}},
 {id:'game',name:'Can you crack the number?',type:'python',category:'Python',description:'Explore conditions and loops with a number-guessing experiment.',level:'Next steps',time:'20 min',tagline:'Follow the clues to find the hidden number.',files:{'main.py':'import random\n\nsecret = random.randint(1, 20)\nguesses = [3, 7, 12, 16, 20]\n\n# Change your guesses and run again!\nfor guess in guesses:\n    if guess == secret:\n        print(f"You got it! The number was {secret}.")\n        break\n    elif guess < secret:\n        print(f"{guess}: try higher")\n    else:\n        print(f"{guess}: try lower")\nelse:\n    print(f"The secret was {secret}. Try a new strategy!")\n'}},
 {id:'java',name:'Meet Java classes',type:'java',category:'Java',description:'Give a small class its own name and greeting.',level:'First steps',time:'15 min',tagline:'Make an object introduce itself.',files:{'Main.java':'class Greeter {\n    String message(String name) {\n        return "Hello, " + name + "!";\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Greeter greeter = new Greeter();\n        System.out.println(greeter.message("curious coder"));\n    }\n}\n'}},
 {id:'cpp',name:'A C++ counting loop',type:'cpp',category:'C++',description:'Use a loop to count up and build a tiny pattern.',level:'First steps',time:'15 min',tagline:'Change the limit and watch the pattern grow.',files:{'main.cpp':'#include <iostream>\n\nint main() {\n    for (int step = 1; step <= 5; ++step) {\n        for (int star = 0; star < step; ++star) {\n            std::cout << "*";\n        }\n        std::cout << "\\n";\n    }\n    return 0;\n}\n'}},
 {id:'c',name:'Make a C greeting',type:'c',category:'C',description:'Print a greeting, then personalize it with a variable.',level:'First steps',time:'10 min',tagline:'Edit the message that appears in your program.',files:{'main.c':'#include <stdio.h>\n\nint main(void) {\n    const char *name = "curious coder";\n    printf("Hello, %s!\\n", name);\n    return 0;\n}\n'}},
 {id:'planet',name:'Name a tiny planet',type:'web',category:'Web development',description:'Make a small page for a planet with its own colors and welcome message.',level:'First steps',time:'15 min',tagline:'Give a new world a name and a point of view.',files:{'index.html':'<main class="planet-card">\n  <span>FIELD NOTES · 01</span>\n  <h1>Welcome to Moonberry</h1>\n  <p>A tiny planet with a very big sky.</p>\n  <button onclick="document.querySelector(\'p\').textContent=\'You found the moon garden!\'">Explore the garden</button>\n</main>','style.css':'body { margin:0; min-height:100vh; display:grid; place-items:center; background:#e7f1f2; font-family:system-ui,sans-serif; color:#183a40; }\n.planet-card { max-width:420px; padding:36px; border-radius:24px; background:#fff; box-shadow:0 18px 50px #183a4020; }\nspan { color:#527d80; letter-spacing:2px; font-size:11px; }\nh1 { line-height:1.1; }\nbutton { border:0; border-radius:9px; padding:12px 16px; background:#286b70; color:#fff; cursor:pointer; }'}}
];

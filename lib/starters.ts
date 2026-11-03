import {webFiles} from './model';
import {turtleStarter} from './turtle-starter';
export type Starter={id:string;name:string;type:'web'|'python';category:string;description:string;level:string;time:string;files:Record<string,string>};
export const starters:Starter[]=[
 {id:'turtle',name:'Draw outside the lines',type:'python',category:'Turtle graphics',description:'Turn a few lines of Python into your own generative artwork.',level:'Beginner',time:'15 min',files:{'main.py':turtleStarter}},
 {id:'web',name:'A website that’s all you',type:'web',category:'Web development',description:'Build a little corner of the internet. Make it unmistakably yours.',level:'Beginner',time:'20 min',files:{...webFiles}},
 {id:'python',name:'Hello, Python. Hello, possibility.',type:'python',category:'Python',description:'Meet variables, loops, and the joy of making something work.',level:'First steps',time:'10 min',files:{'main.py':'# A little introduction, written by you.\nname = "curious coder"\nprint(f"Hello, {name}!")\n\n# What happens if you change the number?\nfor step in range(1, 6):\n    print("✦" * step)\n'}},
 {id:'game',name:'Can you crack the number?',type:'python',category:'Python',description:'Explore conditions and loops with a number-guessing experiment.',level:'Next steps',time:'20 min',files:{'main.py':'import random\n\nsecret = random.randint(1, 20)\nguesses = [3, 7, 12, 16, 20]\n\n# Change your guesses and run again!\nfor guess in guesses:\n    if guess == secret:\n        print(f"You got it! The number was {secret}.")\n        break\n    elif guess < secret:\n        print(f"{guess}: try higher")\n    else:\n        print(f"{guess}: try lower")\nelse:\n    print(f"The secret was {secret}. Try a new strategy!")\n'}}
];

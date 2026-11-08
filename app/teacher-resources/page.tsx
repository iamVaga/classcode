import type {Metadata} from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Teacher resources',
  description: 'Short classroom lessons for Python, Turtle, and the web.',
};

const lessons = [
  {
    title: 'Change a Python greeting',
    duration: '10 minutes',
    goal: 'Use a variable inside an f-string.',
    steps: ['Open the Hello, Python starter and run it.', 'Change the value of name. Predict the next greeting before running again.'],
    prompt: 'Which part of the output changes when you change the variable?',
  },
  {
    title: 'Predict a Turtle pattern',
    duration: '15 minutes',
    goal: 'Connect loop counts and turn angles to the resulting drawing.',
    steps: ['Open Draw outside the lines and run it.', 'Change just one turn angle. Sketch your prediction before you run again.'],
    prompt: 'What stayed the same when you changed the angle?',
  },
  {
    title: 'Make a web page yours',
    duration: '20 minutes',
    goal: 'Recognize which changes belong in HTML and which belong in CSS.',
    steps: ['Open A website that’s all you and run the preview.', 'Change a heading in HTML and a color in CSS. Explain each edit to a partner.'],
    prompt: 'Which file would you edit to change the words without changing the colors?',
  },
];

export default function TeacherResourcesPage() {
  return (
    <main className="studio-main">
      <article className="trust-page">
        <Link className="trust-breadcrumb" href="/#tracks">Browse project starters</Link>
        <header>
          <h1>Teacher resources</h1>
          <p>Short lessons that build on projects students can run in ClassCode.</p>
        </header>
        <div className="trust-sections">
          {lessons.map(lesson => (
            <section className="trust-section" key={lesson.title}>
              <h2>{lesson.title}</h2>
              <p>{lesson.duration}. {lesson.goal}</p>
              <ol>{lesson.steps.map(step => <li key={step}>{step}</li>)}</ol>
              <p><strong>Ask the class.</strong> {lesson.prompt}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

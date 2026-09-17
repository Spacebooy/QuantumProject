import { lessons } from './tutorialLessons';
export default function TutorialLessonSelector({tutorial}) {
  return <div className="tutorial-lessons">
    <p>{tutorial.completed} / 18 core lessons completed. Skipped steps stay available.</p>
    {['Foundations','Multi Qubit','Noise','Advanced'].map(category=><section key={category}>
      <h3>{category}</h3><div className="tutorial-lesson-grid">
        {lessons.filter(l=>l.category===category).map(l=>{
          const done=l.steps.filter(s=>tutorial.progress[`${l.id}/${s.id}`]==='done').length;
          const skipped=l.steps.some(s=>tutorial.progress[`${l.id}/${s.id}`]==='skipped');
          return <button key={l.id} onClick={()=>tutorial.start(l.id)}>{l.title}<small>{done===l.steps.length?'Completed':`${done}/${l.steps.length} steps${skipped?' · skipped steps':''}`}</small></button>;
        })}
      </div>
    </section>)}
  </div>;
}

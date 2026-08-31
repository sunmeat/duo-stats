export default function CourseList({ courses, flagFor }) {
    if (!courses.length) {
        return <p className="courses__empty">Курсы не найдены или профиль скрыт.</p>;
    }

    const topCourses = courses.slice(0, 10);
    const maxXp = Math.max(...topCourses.map((c) => c.xp), 1);

    return (
        <div className="courses">
            <h2>
                Топ курсов ({topCourses.length}
                {courses.length > 10 ? ` из ${courses.length}` : ""})
            </h2>
            <ul className="courses__list">
                {topCourses.map((course) => (
                    <li className="course" key={course.id}>
            <span className="course__flag">
              {flagFor(course.language, course.title)}
            </span>
                        <div className="course__body">
                            <div className="course__row">
                                <span className="course__title">{course.title}</span>
                                <span className="course__xp">
                  {course.xp.toLocaleString("ru-RU")} XP
                </span>
                            </div>
                            <div className="course__bar">
                                <div
                                    className="course__bar-fill"
                                    style={{ width: `${(course.xp / maxXp) * 100}%` }}
                                />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

import * as api from './cycle2';

describe('Basic Cycle', () => {
    let cycle: api.Cycle;
    beforeEach(() => {
        cycle = new api.Cycle;

        const t1 = new api.AtomTask('Task 1', 3);
        const t2 = new api.AtomTask('Task 2', 2);
        const t3 = new api.AtomTask('Task 3', 5);
        cycle.pushTask(t1);
        cycle.pushTask(t2);
        cycle.pushTask(t3);

        const lc1 = api.Link.createLink(cycle.start, t1.startIn);
        const l12 = api.Link.createLink(t1.finishOut, t2.startIn);
        const l23 = api.Link.createLink(t2.finishOut, t3.startIn);
        const l3c = api.Link.createLink(t3.finishOut, cycle.finish);
        cycle.pushLink(lc1);
        cycle.pushLink(l12);
        cycle.pushLink(l23);
        cycle.pushLink(l3c);
    });

    it ('filters starting and finishing tasks', () => {
        const st = cycle.startingTasks;
        const ft = cycle.finishingTasks;
        expect(st.length).toBe(0);
        expect(ft.length).toBe(0);
    });

    it('plans correctly', () => {
        const cp = api.planCycle(cycle, 1);
        expect(cp.tasks.length).toBe(3);
        expect(cp.tasks[0].earlyStart).toBe(0);
        expect(cp.tasks[0].earlyFinish).toBe(3);
        expect(cp.tasks[1].earlyStart).toBe(3);
        expect(cp.tasks[1].earlyFinish).toBe(5);
        expect(cp.tasks[2].earlyStart).toBe(5);
        expect(cp.tasks[2].earlyFinish).toBe(10);
        expect(cp.cycleTime).toBe(10);
    });
});

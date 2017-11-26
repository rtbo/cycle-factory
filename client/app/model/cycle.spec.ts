
import * as api from './cycle';

describe('Basic Cycle', () => {
    let cycle: api.Cycle;
    const ct = 10;
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

    function testXCycles(count: number) {
        const cp = cycle.plan(count);
        expect(cp.count).toBe(count);
        expect(cp.cycleTime).toBe(ct);
        expect(cp.planUntil).toBe(ct*count);
        for (let i=0; i<count; ++i) {
            const offset = ct*i;
            expect(cp.lookUpTask(cycle.tasks[0], i).earlyStart).toBe(offset+0);
            expect(cp.lookUpTask(cycle.tasks[0], i).earlyFinish).toBe(offset+3);
            expect(cp.lookUpTask(cycle.tasks[1], i).earlyStart).toBe(offset+3);
            expect(cp.lookUpTask(cycle.tasks[1], i).earlyFinish).toBe(offset+5);
            expect(cp.lookUpTask(cycle.tasks[2], i).earlyStart).toBe(offset+5);
            expect(cp.lookUpTask(cycle.tasks[2], i).earlyFinish).toBe(offset+10);

        }
    }


    it('plans correctly 1 cycle', () => {
        testXCycles(1);
    });

    it('plans correctly 2 cycles', () => {
        testXCycles(2);
    });

    it('plans correctly 3 cycles', () => {
        testXCycles(3);
    });
});

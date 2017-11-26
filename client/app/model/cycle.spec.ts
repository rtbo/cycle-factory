
import * as api from './cycle';

describe('Basic Cycle', () => {
    let cycle: api.Cycle;
    let t1: api.Task;
    let t2: api.Task;
    let t3: api.Task;
    let lc1: api.Link;
    let l12: api.Link;
    let l23: api.Link;
    let l3c: api.Link;
    const ct = 10;

    beforeEach(() => {
        cycle = new api.Cycle;

        t1 = new api.AtomTask('Task 1', 3);
        t2 = new api.AtomTask('Task 2', 2);
        t3 = new api.AtomTask('Task 3', 5);
        cycle.pushTask(t1);
        cycle.pushTask(t2);
        cycle.pushTask(t3);

        lc1 = api.Link.createLink(cycle.start, t1.startIn);
        l12 = api.Link.createLink(t1.finishOut, t2.startIn);
        l23 = api.Link.createLink(t2.finishOut, t3.startIn);
        l3c = api.Link.createLink(t3.finishOut, cycle.finish);
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
            const tp1 = cp.lookUpTask(t1, i);
            const tp2 = cp.lookUpTask(t2, i);
            const tp3 = cp.lookUpTask(t3, i);

            expect(tp1.earlyStart).toBe(offset+0);
            expect(tp1.earlyFinish).toBe(offset+3);
            expect(tp1.slack).toBe(0);

            expect(tp2.earlyStart).toBe(offset+3);
            expect(tp2.earlyFinish).toBe(offset+5);
            expect(tp2.slack).toBe(0);

            expect(tp3.earlyStart).toBe(offset+5);
            expect(tp3.earlyFinish).toBe(offset+10);
            expect(tp3.slack).toBe(0);
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

describe('Basic Cycle with link from start', () => {
    let cycle: api.Cycle;
    let t1: api.Task;
    let t2: api.Task;
    let t3: api.Task;
    let lc1: api.Link;
    let l12: api.Link;
    let l23: api.Link;
    let l3c: api.Link;
    const ct = 7;

    beforeEach(() => {
        cycle = new api.Cycle;

        t1 = new api.AtomTask('Task 1', 3);
        t2 = new api.AtomTask('Task 2', 2);
        t3 = new api.AtomTask('Task 3', 5);
        cycle.pushTask(t1);
        cycle.pushTask(t2);
        cycle.pushTask(t3);

        lc1 = api.Link.createLink(cycle.start, t1.startIn);
        l12 = api.Link.createLink(t1.startOut, t2.startIn);
        l23 = api.Link.createLink(t2.finishOut, t3.startIn);
        l3c = api.Link.createLink(t3.finishOut, cycle.finish);
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
            const tp1 = cp.lookUpTask(t1, i);
            const tp2 = cp.lookUpTask(t2, i);
            const tp3 = cp.lookUpTask(t3, i);

            expect(tp1.earlyStart).toBe(offset+0);
            expect(tp1.earlyFinish).toBe(offset+3);
            expect(tp1.slack).toBe(0);

            expect(tp2.earlyStart).toBe(offset+0);
            expect(tp2.earlyFinish).toBe(offset+2);
            expect(tp2.slack).toBe(0);

            expect(tp3.earlyStart).toBe(offset+2);
            expect(tp3.earlyFinish).toBe(offset+7);
            expect(tp3.slack).toBe(0);
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


describe('Overlapping Cycle', () => {
    let cycle: api.Cycle;
    let t1: api.Task;
    let t2: api.Task;
    let t3: api.Task;
    let t4: api.Task;
    let lc1: api.Link;
    let l12: api.Link;
    let l23: api.Link;
    let l3c: api.Link;
    let l24: api.Link;
    const ct = 10;

    beforeEach(() => {
        cycle = new api.Cycle;

        t1 = new api.AtomTask('Task 1', 3);
        t2 = new api.AtomTask('Task 2', 2);
        t3 = new api.AtomTask('Task 3', 5);
        t4 = new api.AtomTask('Task 4', 8);
        cycle.pushTask(t1);
        cycle.pushTask(t2);
        cycle.pushTask(t3);
        cycle.pushTask(t4);

        lc1 = api.Link.createLink(cycle.start, t1.startIn);
        l12 = api.Link.createLink(t1.finishOut, t2.startIn);
        l23 = api.Link.createLink(t2.finishOut, t3.startIn);
        l3c = api.Link.createLink(t3.finishOut, cycle.finish);
        l24 = api.Link.createLink(t2.finishOut, t4.startIn);
        cycle.pushLink(lc1);
        cycle.pushLink(l12);
        cycle.pushLink(l23);
        cycle.pushLink(l3c);
        cycle.pushLink(l24);
    });

    it ('filters starting and finishing tasks', () => {
        const st = cycle.startingTasks;
        const ft = cycle.finishingTasks;
        expect(st.length).toBe(0);
        expect(ft.length).toBe(1);
        expect(ft[0].name === 'Task 4');
    });

    function testXCycles(count: number) {
        const cp = cycle.plan(count);
        expect(cp.count).toBe(count);
        expect(cp.cycleTime).toBe(ct);
        expect(cp.planUntil).toBe(ct*count+3);
        for (let i=0; i<count; ++i) {
            const offset = ct*i;
            const tp1 = cp.lookUpTask(t1, i);
            const tp2 = cp.lookUpTask(t2, i);
            const tp3 = cp.lookUpTask(t3, i);
            const tp4 = cp.lookUpTask(t4, i);

            expect(tp1.earlyStart).toBe(offset+0);
            expect(tp1.earlyFinish).toBe(offset+3);
            expect(tp1.slack).toBe(0);

            expect(tp2.earlyStart).toBe(offset+3);
            expect(tp2.earlyFinish).toBe(offset+5);
            expect(tp2.slack).toBe(0);

            expect(tp3.earlyStart).toBe(offset+5);
            expect(tp3.earlyFinish).toBe(offset+10);
            expect(tp3.slack).toBe(0);

            expect(tp4.earlyStart).toBe(offset+5);
            expect(tp4.earlyFinish).toBe(offset+13);
            expect(tp4.slack).toBe(2);
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


describe('Overlapping Cycle with links from start', () => {
    let cycle: api.Cycle;
    let t1: api.Task;
    let t2: api.Task;
    let t3: api.Task;
    let t4: api.Task;
    let lc1: api.Link;
    let l12: api.Link;
    let l23: api.Link;
    let l3c: api.Link;
    let l34: api.Link;
    const ct = 10;

    beforeEach(() => {
        cycle = new api.Cycle;

        t1 = new api.AtomTask('Task 1', 3);
        t2 = new api.AtomTask('Task 2', 2);
        t3 = new api.AtomTask('Task 3', 5);
        t4 = new api.AtomTask('Task 4', 8);
        cycle.pushTask(t1);
        cycle.pushTask(t2);
        cycle.pushTask(t3);
        cycle.pushTask(t4);

        lc1 = api.Link.createLink(cycle.start, t1.startIn);
        l12 = api.Link.createLink(t1.finishOut, t2.startIn);
        l23 = api.Link.createLink(t2.finishOut, t3.startIn);
        l3c = api.Link.createLink(t3.finishOut, cycle.finish);
        l34 = api.Link.createLink(t3.startOut, t4.startIn);
        cycle.pushLink(lc1);
        cycle.pushLink(l12);
        cycle.pushLink(l23);
        cycle.pushLink(l3c);
        cycle.pushLink(l34);
    });

    it ('filters starting and finishing tasks', () => {
        const st = cycle.startingTasks;
        const ft = cycle.finishingTasks;
        expect(st.length).toBe(0);
        expect(ft.length).toBe(1);
        expect(ft[0].name === 'Task 4');
    });

    function testXCycles(count: number) {
        const cp = cycle.plan(count);
        expect(cp.count).toBe(count);
        expect(cp.cycleTime).toBe(ct);
        expect(cp.planUntil).toBe(ct*count+3);
        for (let i=0; i<count; ++i) {
            const offset = ct*i;
            const tp1 = cp.lookUpTask(t1, i);
            const tp2 = cp.lookUpTask(t2, i);
            const tp3 = cp.lookUpTask(t3, i);
            const tp4 = cp.lookUpTask(t4, i);

            expect(tp1.earlyStart).toBe(offset+0);
            expect(tp1.earlyFinish).toBe(offset+3);
            expect(tp1.slack).toBe(0);

            expect(tp2.earlyStart).toBe(offset+3);
            expect(tp2.earlyFinish).toBe(offset+5);
            expect(tp2.slack).toBe(0);

            expect(tp3.earlyStart).toBe(offset+5);
            expect(tp3.earlyFinish).toBe(offset+10);
            expect(tp3.slack).toBe(0);

            expect(tp4.earlyStart).toBe(offset+5);
            expect(tp4.earlyFinish).toBe(offset+13);
            expect(tp4.slack).toBe(2);
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

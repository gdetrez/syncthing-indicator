const SyncthingState = imports.src.syncthing.SyncthingState;
const state_summary = imports.src.syncthing.state_summary;

function testSuite() {

    let mkSyncthingState = function() {
        return new SyncthingState()
    };

    describe('SyncthingState', function() {

        it('starts by being idle', function() {
            var s = mkSyncthingState();
            expect(s.get()).toBe('idle');
        });

        describe('SyncthingState.set', function() {
            it('record the new state', function() {
                var s = mkSyncthingState();
                s.set('syncing');
                expect(s.get()).toBe('syncing');
            });

            it('sends a signal when it changes', function() {
                var s = mkSyncthingState(), arg = null;
                s.connect('changed', function(_, x) { arg = x; });
                s.set('syncing');
                expect(arg).toBe('syncing');
            });

            it("doesn't send a signal when it doesn't changes", function() {
                var s = mkSyncthingState(), arg = null;
                s.connect('changed', function(_, x) { arg = x; });
                s.set('idle');
                expect(arg).toBeNull();
            });
        });
    });

    describe('state_summary', function(){
        var states = ["idle", "scanning", "cleaning", "syncing"];
        for (var i in states) {
            var state = states[i];
            it("returns " + state + " for [" + state + "]", function() {
                expect(state_summary([state])).toBe(state);
            });
        }

        for (var j = 1 ; j < states.length ; j++) {
            var input = states.slice(0, j + 1),
                expected = input[input.length - 1];
            it("returns " + expected + " for [" + input + "]", function() {
                expect(state_summary(input)).toBe(expected);
            });
        }
    });
}

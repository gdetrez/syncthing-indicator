const SyncthingFolder = imports.src.syncthing.SyncthingFolder;

const DummyProxy = {
    config: function(cb) {
        cb({ "Folders": [ { "ID": "foobar", "Path":"/foo/bar" },
                          { "ID": "default", "Path":"Sync" } ] });
    },
    baseurl: "http://foobar:1234",
};

function testSuite() {

    let mkFolder = function() {
        var data = { ID: "foo", Path: "~/foo" };
        return new SyncthingFolder( data );
    };

    describe('SyncthingFolder.getId', function() {
        it('returns the folder ID', function() {
            var sf = mkFolder();
            expect(sf.getId()).toBe("foo");
        });
    });
    describe('SyncthingFolder.getPath', function() {
        it('returns the folder path', function() {
            var sf = mkFolder();
            expect(sf.getPath()).toBe('~/foo');
        });
    });
    describe('SyncthingFolder.update', function() {
        it('sends a signal with the new status', function() {
            var sf = mkFolder();
            var called = false, arg1 = null;
            sf.state.connect('changed', function(_, x) { called = true ; arg1 = x; });
            sf.update( { state: 'syncing' } );
            expect(called).toBe(true);
            expect(arg1).toBe( 'syncing' );
        });
    });
}

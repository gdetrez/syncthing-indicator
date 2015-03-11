const SyncthingServer = imports.src.syncthing.SyncthingServer;

const DummyProxy = {
    config: function(cb) {
        cb({ "Folders": [ { "ID": "foobar", "Path":"/foo/bar" },
                          { "ID": "default", "Path":"Sync" } ] });
    },
    baseurl: "http://foobar:1234",
};

function testSuite() {

    let mkServer = function() {
        return new SyncthingServer(DummyProxy);
    };

    describe('SyncthingServer.getUrl', function() {
        it('should provide the syncthing server url', function() {
            var st = mkServer();
            expect(st.getUrl()).toBe('http://foobar:1234');
        });
    });

    describe('SyncthingServer.addFolder', function(){
        it('creates a new folder object', function(){
            var st = mkServer();
            st.addFolder( { ID: 'foo', Path: '/foo/bar' } );
            expect(st.getFolder('foo').getPath()).toBe('/foo/bar');
        });

        it('emits a signal', function() {
            var sigarg;
            var st = mkServer();
            st.connect('new-folder', function(_, arg) { sigarg = arg; });
            st.addFolder( { ID: 'foo', Path: '/foo/bar' } );
            expect(sigarg).toBe('foo');
        });

        it("does't emit a signal if the folder was already registered", function(){
            var st = mkServer('foobar', 1234);
            st.addFolder( { ID: 'foo', Path: '/foo/bar' } );
            var called = false;
            st.connect('new-folder', function() { called = true; });
            st.addFolder( { ID: 'foo', Path: '/foo/bar' } );
            expect(called).toBe(false);
        });
    });
}

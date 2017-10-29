import vibe.vibe;

void main()
{
    auto router = new URLRouter;

    // add REST api routes here
    //auto restIfaceSettings = new RestInterfaceSettings;
    //restIfaceSettings.baseURL = URL("/api");
    //router.registerRestInterface(new MyAPIImpl, restIfaceSettings);

    // serving static files (including angular files)
    auto fileServerSettings = new HTTPFileServerSettings;
    fileServerSettings.options = HTTPFileServerOption.serveIndexHTML;
    router.get("*", serveStaticFiles("./dist/", fileServerSettings));

    auto settings = new HTTPServerSettings;
    settings.port = 8080;
    settings.bindAddresses = ["::1", "127.0.0.1"];
    listenHTTP(settings, router);

    logInfo("Please open http://127.0.0.1:8080/ in your browser.");
    runApplication();
}

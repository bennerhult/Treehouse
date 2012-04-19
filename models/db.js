var mongoConf = {
    protocol: "mongodb",
    user: "",
    pass: "",
    name: "test",
    host: "localhost",
    port: "27017"
};

var uri= mongoConf.protocol + '://' + mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.name;


module.exports = {
    uri: uri
};
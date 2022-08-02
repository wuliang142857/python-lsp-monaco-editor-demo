module.exports = function (api) {
    api.cache(true);

    const presets = [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript"

    ];
    const plugins = [
        "react-hot-loader/babel",
        "lodash",
        [
            "import",
            {
                "libraryName": "antd",
                "libraryDirectory": "lib",
                "style": true
            }
        ]
    ];

    return {
        presets,
        plugins
    };
};

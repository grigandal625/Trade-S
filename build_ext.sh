rm -rf build_ext
mkdir build_ext
mkdir build_ext/popup
mkdir build_ext/react-content-script
mkdir build_ext/settings

cp -r popup/build build_ext/popup/build
cp -r react-content-script/build build_ext/react-content-script/build
cp -r settings/build build_ext/settings/build

cp background.js build_ext/background.js
cp manifest.json build_ext/manifest.json
cp mainscript.js build_ext/mainscript.js
cp icon_128.png build_ext/icon_128.png
cp Logo.png build_ext/Logo.png

#!/bin/bash
#
# set proper settings for 'neutralino'
# - browser or desktop app
# - name of the index_name.html to run

# check arg
if [ $# -eq 0 ]; then
    echo "usage $0 [-m|--mode browser|desktop] <name> (where index_name.html exists)"
    exit;
fi

mode="browser"
# check options
while true; do
    case "$1" in
        -m|--mode)
            shift 1;
            mode=$1;
            shift 1;;
        *)
            name=$1
            break;
    esac
done

# change mode
if [[ $mode == "browser" ]]
then
    rm -f "app/settings.json"
    ln -s "settings-browser.json" "app/settings.json"
elif [[ $mode == "desktop" ]]
then
    rm -f "app/settings.json"
    ln -s "settings-app.json" "app/settings.json"
else
    echo "$0 : ERROR '$mode' is an improper mode (browser or desktop)"
    exit;
fi

# set executable
if [ -f "app/index_$name.html" ]
then
    echo "setting app/index_$name.html"
    rm -f "app/index.html"
    ln -s "index_$name.html" "app/index.html"
else
    echo "$0 : ERROR app/index_$name.html does not exists !"
    exit;
fi

i1=`ps -ef|grep -E  "./node /home/project/moka/game/app.js" |grep -v grep| awk '{print $2}'`
i2=`ps -ef|grep -E  "/home/project/moka/node /home/project/moka/game/app.js" |grep -v grep| awk '{print $2}'`

kill -9 $i1
kill -9 $i2

echo kill $i1 ok.
echo kill $i2 ok.

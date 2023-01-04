CONTAINERID=$(sudo docker ps -q)

shell=$1
if [ -z "$*" ]; then shell='bash' ;fi

if [ ! "$TERM" = "" ]; then
  sudo docker exec -e COLUMNS="`tput cols`" -e LINES="`tput lines`" -it $CONTAINERID $shell
else
  sudo docker exec -i $CONTAINERID $shell
fi


#!/bin/sh

DIR_PATH="test/assets/https-certs"
FILE_PATH="$DIR_PATH/https"

mkdir -p $DIR_PATH

# ca
openssl genrsa -out $FILE_PATH.ca.key 1024
openssl req -x509 -new -nodes -key $FILE_PATH.ca.key -days 999 -out $FILE_PATH.ca.crt -subj "/C=DE/ST=Konstanz/L=Konstanz/O=Global Security/OU=IT Department/CN=example.com"

# server from ca
openssl genrsa -out $FILE_PATH.srv.key 1024
openssl req -new -key $FILE_PATH.srv.key -out $FILE_PATH.srv.csr -subj "/C=DE/ST=Konstanz/L=Konstanz/O=Global Security/OU=IT Department/CN=localhost"
openssl x509 -req -days 999 -in $FILE_PATH.srv.csr -CA $FILE_PATH.ca.crt -CAkey $FILE_PATH.ca.key -set_serial 01 -out $FILE_PATH.srv.crt

# server selfsigned
openssl genrsa -out $FILE_PATH.srv-selfsigned.key 1024
openssl req -new -key $FILE_PATH.srv-selfsigned.key -out $FILE_PATH.srv-selfsigned.csr -subj "/C=DE/ST=Konstanz/L=Konstanz/O=Global Security/OU=IT Department/CN=localhost"
openssl x509 -req -days 365 -in $FILE_PATH.srv-selfsigned.csr -signkey $FILE_PATH.srv-selfsigned.key -out $FILE_PATH.srv-selfsigned.crt

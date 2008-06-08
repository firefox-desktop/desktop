REVISION=`svnversion`
XPI=Desktop_1.3_rev_$REVISION.xpi
echo "Revision: " $REVISION
echo "XPI: " $XPI
rm $XPI
mv install.rdf install.rdf.original
sed -e 's/\(<em:version>.*\)0trunk\(.*<\/em:version>\)/\1'$REVISION'\2/' < install.rdf.original > install.rdf
zip -r -9 $XPI chrome* defaults install.rdf -x '*.svn/*'
mv install.rdf.original install.rdf

postgis:
	docker run -d -p 5438:5432 --name postgis -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret postgis/postgis:17-3.4

dbshell:
	docker exec -it postgis psql -U root -d springbook

createdb:
	docker exec -it postgis createdb --username=root --owner=root springbook

dropdb:
	docker exec -it postgis dropdb --username=root springbook

migrateup:


migratedown:


migratedu:
	make migratedown && make migrateup

dbseed:


flowseed:


run:
	pnpm dev

start:
	pnpm start

build:
	pnpm build
import { DataSource } from "typeorm"
import { RequestEntity } from "../entities/request.entity"
import path from "path"
import { ContactEntity } from "../entities/contact.entity";
import { TokenEntity } from "../entities/token.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "aigateway",
    password: "aigateway",
    database: "aigateway",
    entities: [RequestEntity, ContactEntity, TokenEntity],
    // logging: true,
    migrations: [path.join(__dirname, 'migrations', '*.ts')],
    synchronize: true,
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
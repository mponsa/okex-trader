import {server} from './app'

const main = async () => {
    server.listen('8080', () => {console.log("App listening at localhost:8080")})
}

main()


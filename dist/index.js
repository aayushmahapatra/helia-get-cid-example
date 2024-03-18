var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProtocolEnum, SpheronClient } from "@spheron/storage";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
const SPHERON_TOKEN = process.env.SPHERON_TOKEN;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // generate cid before upload using helia
        const pathToFile = "./test";
        const helia = yield createHelia();
        const heliaFs = unixfs(helia);
        const stat = yield fs.promises.stat(pathToFile);
        if (stat.isFile()) {
            const fileContent = fs.readFileSync(pathToFile);
            const fileName = path.basename(pathToFile);
            const emptyDirCid = yield heliaFs.addDirectory();
            const fileCid = yield heliaFs.addBytes(fileContent);
            const cid = yield heliaFs.cp(fileCid, emptyDirCid, fileName);
            console.log("CID before upload: ", cid.toString());
        }
        else {
            const files = fs.readdirSync(pathToFile);
            let dirCid = yield heliaFs.addDirectory();
            for (const file of files) {
                console.log(file);
                const filePath = `${pathToFile}/${file}`;
                const fileContent = fs.readFileSync(filePath);
                const fileCid = yield heliaFs.addBytes(fileContent);
                dirCid = yield heliaFs.cp(fileCid, dirCid, file);
            }
            console.log("CID before upload: ", dirCid.toString());
        }
        // upload test folder via sdk and fetch the cid for comparison
        const spheron = new SpheronClient({
            token: SPHERON_TOKEN || "",
        });
        console.log("Uploading...");
        const uploadRes = yield spheron.upload("./test", {
            name: "SDK Test",
            protocol: ProtocolEnum.IPFS,
        });
        console.log("Upload CID: ", uploadRes.cid);
    }
    catch (error) {
        console.error(error);
    }
});
main();

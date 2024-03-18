import { ProtocolEnum, SpheronClient } from "@spheron/storage";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const SPHERON_TOKEN = process.env.SPHERON_TOKEN;

const main = async () => {
  try {
    // generate cid before upload using helia
    const pathToFile = "./test";
    const helia = await createHelia();
    const heliaFs = unixfs(helia);

    const stat = await fs.promises.stat(pathToFile);
    if (stat.isFile()) {
      const fileContent = fs.readFileSync(pathToFile);
      const fileName = path.basename(pathToFile);
      const emptyDirCid = await heliaFs.addDirectory();
      const fileCid = await heliaFs.addBytes(fileContent);
      const cid = await heliaFs.cp(fileCid, emptyDirCid, fileName);
      console.log("CID before upload: ", cid.toString());
    } else {
      const files = fs.readdirSync(pathToFile);
      let dirCid = await heliaFs.addDirectory();
      for (const file of files) {
        console.log(file);
        const filePath = `${pathToFile}/${file}`;
        const fileContent = fs.readFileSync(filePath);
        const fileCid = await heliaFs.addBytes(fileContent);
        dirCid = await heliaFs.cp(fileCid, dirCid, file);
      }
      console.log("CID before upload: ", dirCid.toString());
    }

    // upload test folder via sdk and fetch the cid for comparison
    const spheron = new SpheronClient({
      token: SPHERON_TOKEN || "",
    });
    console.log("Uploading...");
    const uploadRes = await spheron.upload("./test", {
      name: "SDK Test",
      protocol: ProtocolEnum.IPFS,
    });
    console.log("Upload CID: ", uploadRes.cid);
  } catch (error) {
    console.error(error);
  }
};

main();

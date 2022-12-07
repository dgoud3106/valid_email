import { useState } from "react";
import { Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";
let resultFile = [];
let validEmails = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default function Home() {
  const [input, setInput] = useState("");
  const [fileData, setFileData] = useState();
  const submitHandler = (e) => {
    e.preventDefault();
   

    if (input === "") {
      alert("Upload CSV file");
    } else {
      if (
        input.slice(input.length - 4, input.length).toLowerCase() === ".csv"
      ) {
        alert("Submitted Successfully");
      } else {
        alert("upload only CSV files");
      }
    }
  };

  const fileHandler = (e) => {
    setInput(e.target.value);
    console.log(e);
    const [file] = e.target.files;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      console.log(bstr)
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      console.log(ws)
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      console.log(data);

      setFileData(data);
      if (data !== undefined) {
        data.map((item) => {
          if (
            item[1].match(validEmails) !== null
          ) {
            let newData = [...item, "Valid"];
            resultFile.push([newData]);
          } else {
            let newData = [...item, "In Valid"];
            resultFile.push([newData]);
          }
        });
      }
      console.log(resultFile);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <center>
      <div className="row">
        <div className="d-flex justify-content-center ">
          <form>
            <h1 style={{ fontSize: "20px" }} className="text-primary">
              validation page
            </h1>
            <input
              type="file"
              accept=".csv"
              onChange={fileHandler}
              className="col-12 col-md-6"
            />
            <Button variant="success m-2" type="submit" onClick={submitHandler}>
              Submit
            </Button>
          </form>
        </div>
      </div>
      <div>
        <CSVLink data={resultFile.flat()}>Download</CSVLink>
      </div>
    </center>
  );
}

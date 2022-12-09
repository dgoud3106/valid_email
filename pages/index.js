import { useState } from "react";
import { Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";
import styles from '../styles/Home.module.css'

let resultFile = [];
let validEmails = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default function Home() {
  const [input, setInput] = useState("");
  const [fileData, setFileData] = useState();
  const [resultData, setResultData] = useState();

  const downloadHandler = async () => {
    let response = await fetch("http://localhost:1337/api/tests");
    let result = await response.json();
    setResultData(result.data);
  };
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
  const deleteHandler = async (deleteId) => {
    const response = await fetch(
      `http://localhost:1337/api/tests/${deleteId}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json();
    downloadHandler();
  };

  const fileHandler = (e) => {
    setInput(e.target.value);
    console.log(e);
    const [file] = e.target.files;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      console.log(bstr);
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      console.log(ws);
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // console.log(data);

      setFileData(data);
      if (data !== undefined) {
        data.map((item) => {
          if (item[1].match(validEmails) !== null) {
            let newData = [...item, "Valid"];
            resultFile.push([newData]);
          } else {
            let newData = [...item, "InValid"];
            resultFile.push([newData]);
          }
        });
      }
      const test = async (data) => {
        console.log(data);
        let response = await fetch("http://localhost:1337/api/tests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              email: data.email,
              status: data.status,
            },
          }),
        });
      };
      resultFile.map(
        (item) =>
          item[0][0] !== "S.No" &&
          test({ email: item[0][1], status: item[0][2] })
      );
    };
    reader.readAsBinaryString(file);
  };

  return (
    <center>
      <div className="row">
        <div className="d-flex justify-content-center ">
          <form>
            <h1 className={styles.heading} >
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
        <button onClick={downloadHandler} className="btn btn-outline-secondary m-2">Download</button>
        <table >
          {resultData !== undefined
            ? resultData.map((item) => {
                return (
                  <tr>
                    <td style={{ border: "2px solid black" }}>
                      {item.attributes.email}
                    </td>
                    <td style={{ border: "2px solid black" }}>
                      {item.attributes.status}
                    </td>
                    <button className="btn btn-outline-danger" onClick={() => deleteHandler(item.id)}>
                      Delete
                    </button>
                  </tr>
                );
              })
            : null}
        </table>
        {/* <CSVLink data={resultFile.flat()}>Download</CSVLink> */}
      </div>
    </center>
  );
}

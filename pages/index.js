import { Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";
import styles from "../styles/Home.module.css";
import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";

let resultFile = [];
let validEmails = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default function Home() {
  const [input, setInput] = useState("");
  const [fileData, setFileData] = useState();
  const [resultData, setResultData] = useState();
  const [value, setValue] = useState();

  const [show, setShow] = useState(false);
  const [data, setData] = useState();
  const [events, setevents] = useState();
  const [getEvents, setGetEvents] = useState();

  const eventData = async () => {
    let response = await fetch("http://localhost:1337/api/event-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          event_title: data,
        },
      }),
    });
  };
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
        // downloadHandler()
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

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleClose = () => setShow(false);

  const handleShow = (e) => {
    e.preventDefault();
    setShow(true);
  };

  const fileHandler = (e) => {
    setInput(e.target.value);
    // console.log(e);
    const [file] = e.target.files;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      // console.log(bstr);
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // console.log(ws);
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
        //  console.log(getEvents);
        let response = await fetch("http://localhost:1337/api/tests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              email: data.email,
              status: data.status,
              event_list: [getEvents],
            },
          }),
        });
      };
      resultFile.map((item) => {
        // console.log(item)
        item[0][0] !== "S.No" &&
          test({
            email: item[0][1],
            status: item[0][2],
          });
      });
    };
    reader.readAsBinaryString(file);
    downloadHandler();
    // console.log(resultFile);
  };
  const getData = async () => {
    let response = await fetch("http://localhost:1337/api/event-lists");
    let results = await response.json();
    setevents(results.data);
    // console.log(events);
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <center>
      <h1 className={styles.heading}>validation page</h1>

      <button onClick={handleShow} className="btn btn-outline-success">
        Create List
      </button>
      <select
        className={styles.option}
        value={getEvents}
        onClick={() => getData()}
        onChange={(e) => {
          setGetEvents(e.target.value);
          console.log(getEvents);
        }}
      >
        {events !== undefined &&
          events.map((item) => (
            <option key={item.id} value={item.id}>
              {item.attributes.event_title}
            </option>
          ))}
      </select>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Create event"
            onChange={(e) => setData(e.target.value)}
          />
          <Button variant="primary" onClick={eventData}>
            Create
          </Button>
        </Modal.Body>
      </Modal>

      <div className="row">
        <div className="d-flex justify-content-center ">
          <form>
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
        <table>
          <thead>
            <tr>
              <th>Emails</th>
              <th>Status</th>
              <th>Event</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {resultData !== undefined
              ? resultData.map((item, key) => {
                  return (
                    <tr key={key}>
                      <td style={{ border: "2px solid black" }}>
                        {item.attributes.email}
                      </td>
                      <td style={{ border: "2px solid black" }}>
                        {item.attributes.status}
                      </td>
                      <td>{item.attributes.event_title}</td>
                      <td>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => deleteHandler(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        {/* <CSVLink data={resultFile.flat()}>Download</CSVLink> */}
      </div>
    </center>
  );
}

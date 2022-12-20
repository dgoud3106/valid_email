import styles from "../../styles/Home.module.css";
import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Modal from "react-bootstrap/Modal";

let finalResultData = [];
let validEmails = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default function Home() {
  const [input, setInput] = useState("");
  const [fileData, setFileData] = useState();
  const [dataOnUi, setDataOnUi] = useState();
  const [value, setValue] = useState();

  const [show, setShow] = useState(false);
  const [data, setData] = useState();
  const [events, setevents] = useState();
  const [getEvents, setGetEvents] = useState();
  const [uniqueList, setUniqueList] = useState([]);
  const [eventId,setEventId] = useState();

  const postingDataIntoStrapi = async (data) => {
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
          event_list: [getEvents],
        },
      }),
    });
  };
  const finalDataOnUi = async () => {
    let response = await fetch("http://localhost:1337/api/tests?populate=*");
    let result = await response.json();
    setDataOnUi(result.data);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    // console.log(getEvents);

    if (input === "") {
      alert("Upload CSV file");
    } else {
      if (
        input.slice(input.length - 4, input.length).toLowerCase() === ".csv"
      ) {
        finalResultData.map((item) => {
          item[0][0] !== "S.No" &&
            postingDataIntoStrapi({
              email: item[0][1],
              status: item[0][2],
            });
        });
        alert("Submitted Successfully");
        finalDataOnUi();
        finalResultData = []
        // console.log(dataOnUi);
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
    finalDataOnUi();
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };
  const handleClose = () => setShow(false);

  const handleShow = (e) => {
    e.preventDefault();
    setShow(true);
  };
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

  let uniqueMailList = () => {
    let allmails = [];
    let mailEventList = [];
    if (dataOnUi !== undefined) {
      dataOnUi.map((item) => allmails.push(item.attributes.email));
      dataOnUi.map((item) =>
        mailEventList.push([
          item.attributes.email,
          item.attributes.event_list.data.attributes.event_title,
        ])
      );
    }
    let newList = new Set(allmails);
    // console.log(mailEventList);
    // console.log(allmails);
    let updateList = [];
    for (let i of newList) {
      let selectedEvent = [];
      for (let j of mailEventList) {
        if (i == j[0]) {
          if (selectedEvent == j[i]) {
          } else {
            selectedEvent.push(j[1]);
          }
        }
      }
      updateList.push([i, selectedEvent]);
    }
    setUniqueList(updateList);
  };

  const fileHandler = (e) => {
    setInput(e.target.value);

    const [file] = e.target.files;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;

      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      setFileData(data);

      if (data !== undefined) {
        data.map((item) => {
          if (item[1].match(validEmails) !== null) {
            let newData = [...item, "Valid"];
            finalResultData.push([newData]);
          } else {
            let newData = [...item, "In Valid"];
            finalResultData.push([newData]);
          }
        });
      }
    };
    reader.readAsBinaryString(file);
    finalDataOnUi();
    // console.log(finalResultData)
  };

  const getData = async () => {
    let response = await fetch("http://localhost:1337/api/event-lists");
    let results = await response.json();
    setevents(results.data);
    // console.log(getData);
  };
  useEffect(() => {
    getData();
    finalDataOnUi();
    uniqueMailList();
  }, []);

  return (
    <center className="d-flex flex-column justify-content-center align-items-center">
      <h1 className={styles.heading}>Validation Page</h1>
      <button onClick={handleShow} className="btn btn-outline-success">
        Create Event
      </button>
      <select
        className={styles.option}
        value={getEvents}
        onClick={(e) => getData(e)}
        onChange={(e) => {
          setGetEvents(e.target.value);
          // console.log(getEvents);
        }}
      >
        <option value=""></option>
        {events !== undefined &&
          events.map((item) => (
            <option key={item.id} value={item.id}>
              {item.attributes.event_title}
            </option>
          ))}
      </select>
      <button
        className={getEvents == "" ? "d-flex" : "d-none"}
        onClick={uniqueMailList}
      >
        click
      </button>
      {/* {console.log(uniqueList)} */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Create event"
            onChange={(e) => setData(e.target.value)}
          />
          <Button variant="primary" onClick={eventData}>
            submit
          </Button>
        </Modal.Body>
      </Modal>
      <div>
        <form>
          <input type="file" accept=".csv" onChange={fileHandler} />
          <Button variant="success m-2" type="submit" onClick={submitHandler}>
            Upload
          </Button>
        </form>
      </div>
      <table className={getEvents == "" ? "d-flex flex-column" : "d-none"}>
        {/* <thead>
          <tr>
            <th>Emails</th>

            <th>Events</th>
          </tr>
        </thead> */}

        <tbody>
          {uniqueList !== undefined &&
            uniqueList.map((item) => {
              // console.log(item);
              return (
                <tr key={uniqueList.indexOf(item) + 1}>
                  <td style={{ border: "2px solid black" }}>{item[0]}</td>
                  <td style={{ border: "2px solid black" }}>{item[1]}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <table className={getEvents === "" ? "d-none" : "d-flex flex-column"}>
        <tbody>
          {dataOnUi !== undefined
            ? dataOnUi.map((item, key) => {
             
              if (item.attributes.event_list.data !== null) {
                console.log(getEvents)
                if (item.attributes.event_list.data.id == getEvents) {
                 
                  return (
                    <tr key={dataOnUi.indexOf(item) + 1}>
                      <td>{item.attributes.email}</td>
                      <td>{item.attributes.status}</td>
                      <td>
                        {
                          item.attributes.event_list.data.attributes
                            .event_title
                        }
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => deleteHandler(item.id)}
                        >
                          delete
                        </button>
                      </td>
                    </tr>
                  );
                }
              }
            })

            : null}
        </tbody>
      </table>
    </center>
  );
}

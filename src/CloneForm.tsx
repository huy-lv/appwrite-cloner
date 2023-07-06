import {
  Button,
  Card,
  Checkbox,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useState, ChangeEvent, FormEvent, useRef } from "react";
import HostForm from "./HostForm";
import {
  SourceInfo,
  cloneDatabase,
  cloneTeams,
  cloneUsers,
  getAllTeams,
  getAllUsers,
  getCollections,
  getDatabases,
} from "./Service";
import DatabaseView, { DefaultTree, TreeNode } from "./DatabaseView";

const CloneForm = () => {
  const [databases, setDatabases] = useState<TreeNode[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [override, setOverride] = useState<boolean>(false);
  const usersData = useRef<any>([]);
  const teamsData = useRef<any>([]);
  const [running, setRunning] = useState<boolean>(false);
  const logRef = useRef<HTMLDivElement>(null);
  const [sourceData, setSourceData] = useState<SourceInfo>({
    host: "",
    projectId: "",
    apiKey: "",
  });

  const [targetData, setTargetData] = useState<SourceInfo>({
    host: "",
    projectId: "",
    apiKey: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSourceData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTargetData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addLog = (message: string) => {
    setMessages((prevMessages) => [`🟢 ${message}`, ...prevMessages]);
  };

  const handleFetch = async (e: FormEvent) => {
    e.preventDefault();
    setMessages([]);
    addLog("Fetching source databases...");
    const res = await getDatabases(sourceData);
    const databases = [...res.databases];
    for (const db of databases) {
      const res2 = await getCollections({
        ...sourceData,
        databaseId: db.$id,
      });
      db.children = res2.collections;
    }
    databases.unshift(...DefaultTree);
    const resUsers = await getAllUsers(sourceData);
    databases[0].name = `Users (${resUsers.total} items)`;
    usersData.current = resUsers.users;
    const resTeams = await getAllTeams(sourceData);
    databases[1].name = `Teams (${resTeams.total} items)`;
    teamsData.current = resTeams.teams;
    addLog(
      `Found ${databases.length} databases, ${usersData.current.length} users and ${teamsData.current.length} teams`
    );
    setDatabases(databases);
  };

  const handleStart = async () => {
    addLog("----------------");
    setRunning(true);
    for (const db of databases.filter((db) => db.checked)) {
      switch (db.$id) {
        case "_users_":
          await cloneUsers(usersData.current, targetData, override, addLog);
          break;
        case "_teams_":
          await cloneTeams(teamsData.current, targetData, override, addLog);
          break;
        default:
          await cloneDatabase(db, sourceData, targetData, override, addLog);
          break;
      }
    }
    setRunning(false);
  };

  const handleCheck = (node: string, checked: boolean) => {
    const newDatabases = [...databases];
    for (const db of newDatabases) {
      if (db.$id === node) {
        db.checked = checked;
        if (db.children) {
          for (const child of db.children) {
            child.checked = checked;
          }
        }
      } else if (db.children) {
        for (const child of db.children) {
          if (child.$id === node) {
            child.checked = checked;
          }
        }
      }
      db.checked = db.children?.some((c) => c.checked) || false;
    }
    setDatabases(newDatabases);
  };

  return (
    <form onSubmit={handleFetch}>
      <Grid container padding={1} spacing={1}>
        <Grid item xs>
          <Typography textAlign="left">
            This tool help you to clone database on Appwrite:
            <br />
            1. Create API Key with full access from Appwrite console
            <br />
            2. Enter source info and target info (Feel free to enter API Key
            because this is open source)
            <br />
            3. Click "Fetch"
            <br />
            4. Select items to clone
            <br />
            5. Click "Start clone"
            <br />
            6. Check the logs
          </Typography>
        </Grid>
        <Grid item xs>
          <Card elevation={2}>
            <HostForm
              label="Enter source db:"
              formData={sourceData}
              handleInputChange={handleInputChange}
            />
          </Card>
        </Grid>
        <Grid item xs>
          <Card>
            <HostForm
              label="Enter target db:"
              formData={targetData}
              handleInputChange={handleInputChange2}
            />
          </Card>
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleFetch}>
        Fetch
      </Button>
      <Grid container padding={1} spacing={1}>
        <Grid item xs container alignItems="start" border={1} margin={1}>
          <Typography>Select item to clone</Typography>
          <DatabaseView data={databases} handleCheck={handleCheck} />
        </Grid>
        <Grid item xs>
          <TextField
            label="Log"
            placeholder="Logs will be displayed here"
            variant="outlined"
            value={messages.join("\n")}
            multiline
            fullWidth
            ref={logRef}
            rows={11}
            sx={{
              ".MuiInputBase-root": {
                height: "275px !important",
              },
            }}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="center" spacing={1}>
        <Grid item>
          <Grid container alignItems="center">
            <Checkbox
              disabled={running}
              checked={override}
              onChange={(e) => setOverride(e.target.checked)}
            />
            <Typography>Remove target if existed</Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleStart}>
            {running ? "Running..." : "Start clone"}
          </Button>
        </Grid>
        <Grid item>
          <Button onClick={() => setMessages([])}>Clear log</Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CloneForm;

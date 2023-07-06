import { Grid, Typography, TextField } from "@mui/material";
import { ChangeEvent } from "react";

interface LoginFormState {
  host: string;
  projectId: string;
  apiKey: string;
}

interface LoginFormProps {
  formData: LoginFormState;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export default function HostForm({
  formData,
  handleInputChange,
  label,
}: LoginFormProps) {
  return (
    <Grid padding={2} container direction="column" spacing={2}>
      <Grid item>
        <Typography>{label}</Typography>
      </Grid>
      <Grid item>
        <TextField
          label="Host"
          name="host"
          value={formData.host}
          onChange={handleInputChange}
          variant="outlined"
        />
      </Grid>
      <Grid item>
        <TextField
          label="Project ID"
          name="projectId"
          value={formData.projectId}
          onChange={handleInputChange}
          variant="outlined"
        />
      </Grid>
      <Grid item>
        <TextField
          label="API Key"
          name="apiKey"
          value={formData.apiKey}
          onChange={handleInputChange}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );
}

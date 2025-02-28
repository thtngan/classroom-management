import * as React from 'react';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import Grid from '@mui/material/Grid';
import {AccordionActions, Divider, IconButton, InputAdornment} from "@mui/material";
import Typography from "@mui/material/Typography";
import DeleteIcon from '@mui/icons-material/Delete';
import {Tooltip} from "@mui/material";


export default function GradeStructureEdit({dataName, dataScale, dataId, viewData,
                                           onDataChange, onDeleteData}) {
  const [textValue, setTextValue] = React.useState(dataName);
  const [numberValue, setNumberValue] = React.useState(dataScale);

  const isTextValid = textValue !== '';
  const isNumberValid = numberValue !== null && numberValue !== '' && numberValue !== undefined && !isNaN(Number(numberValue));

  const handleTextChange = (event) => {
    const value = event.target.value;
    setTextValue(value);
    onDataChange(value, numberValue, dataId);
  };


  const handleNumberChange = (event) => {
    const value = event.target.value;
    setNumberValue(value);
    onDataChange(textValue, value, dataId);
  };

  const handleDeleteData = () => {
    onDeleteData(dataId)
  }

    return (
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <TextField
            label="Grade Name"
            variant="outlined"
            fullWidth
            required
            disabled={viewData}
            value={textValue}
            onChange={handleTextChange}
            error={!isTextValid}
            helperText={!isTextValid ? 'Grade Name is required' : ''}
          />
        </Grid>

        <Grid item xs={3} >
          <Typography variant="subtitle2">Grade scale</Typography>
          <Input
            type="number"
            label="Number Field"
            variant="outlined"
            fullWidth
            required
            disabled={viewData}
            value={numberValue}
            onChange={handleNumberChange}
            endAdornment={<InputAdornment position="end">%</InputAdornment>}
            error={!isNumberValid}
            helperText={!isNumberValid ? 'Valid number is required' : ''}
          />

          {!viewData && (
            <AccordionActions style={{marginTop: '10px'}}>
              <Divider orientation="vertical" flexItem/>
              <Tooltip title={'Delete'} arrow onClick={handleDeleteData}>
                <IconButton aria-label="Image">
                  <DeleteIcon style={{ color: 'teal' }} />
                </IconButton>
              </Tooltip>
            </AccordionActions>
          )}

        </Grid>

      </Grid>

  );
}

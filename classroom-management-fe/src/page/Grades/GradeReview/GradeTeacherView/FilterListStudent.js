import * as React from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Button from "@mui/material/Button";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function FilterListStudent({studentList, handleFilterData}) {
  const [personName, setPersonName] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleButton = () => {
    // console.log(personName)
    handleFilterData(personName)
  };


  return (

    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id="demo-multiple-chip-label">Student ID</InputLabel>
      <Select
        labelId="demo-multiple-chip-label"
        id="demo-multiple-chip"
        multiple
        value={personName}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label="Student ID" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {studentList.map((name) => (
          <MenuItem
            key={name.studentId}
            value={name.studentId}
          >
            {name.studentId}
          </MenuItem>
        ))}
      </Select>

      <Button variant="contained" sx={{ mt: 1, backgroundColor : 'teal' }}
              onClick={handleButton}
      >
        Filter
      </Button>

    </FormControl>

  );
}

import * as React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ImportStudentFile from "./ImportStudentFile";
import {utils, writeFile} from "xlsx";

export default function HandleImportExportStudent({onReloadTable, heading, data
                                                  }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleExport = () => {
    const columnNames = heading.map(item => item.name);
    const headings = [columnNames];

    var dataWithoutId = data.map(item => {
      const { id, ...rest } = item;
      return Object.fromEntries(Object.entries(rest));
    });

    const className = localStorage.getItem("className")

    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    utils.sheet_add_json(ws, dataWithoutId, { origin: 'A2', skipHeader: true });
    utils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, 'Student Report_' + className + '.xlsx');
  }

  return (
    <React.Fragment>
      <Box display="flex" justifyContent="flex-end"
           style={{ width : '100%' }}

      >
        <Stack spacing={2} direction="row"
               style={{ paddingRight : '25px' }}

        >
          <Button variant="outlined" endIcon={<UploadIcon />}
                  style={{ borderColor: 'teal', color: 'teal' }}
                  onClick={handleClickOpen}
          >
            Import
          </Button>
          <Button variant="contained" endIcon={<DownloadIcon />}
                  sx={{ backgroundColor : 'teal'}}
                  onClick={handleExport}
          >
            Export
          </Button>
        </Stack>

      </Box>
      <ImportStudentFile open={open} setOpen={setOpen} onReloadTable={onReloadTable}/>

    </React.Fragment>
  );
}
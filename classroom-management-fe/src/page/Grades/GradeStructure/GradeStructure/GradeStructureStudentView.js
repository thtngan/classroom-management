import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import GradeStructureStudentRequest from "./GradeStructureStudentRequest";

export default function GradeStructureStudentView({data, gradeData, showAlert}) {

  // console.log(data)
  // console.log(gradeData)

  return (
    <>
      <Paper elevation={2} style={{width:'100%' , marginTop: '10px', borderLeft: '10px solid' +
          ' teal'}}
      >
        <Box style={{display: 'flex',flexDirection:'column', alignItems:'flex-start', marginLeft: '20px', marginRight: '20px', paddingTop: '20px', paddingBottom: '10px'}}
        >
          <Box  style={{ display: 'flex', alignItems: 'right',  justifyContent: 'right', width: '100%'}}>
            {data.finalized && (
              <Typography style={{ textAlign: 'right', color: 'teal' }}>This grade is final</Typography>
            )}

          </Box>

          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <ListItem
              key={1}
              disableGutters
              secondaryAction={
                <Typography><strong>Grade scale:</strong> {data.gradeScale}%</Typography>
              }
            >
              <ListItemText primary={
                <Typography variant="h6" gutterBottom><strong>Grade name:</strong> {data.name}</Typography>
              } />
            </ListItem>
            {Object.keys(gradeData).length > 0 && (
              <ListItem
                key={2}
                disableGutters
                secondaryAction={
                  <GradeStructureStudentRequest grade={data} currentGrade={gradeData[data.code]} showAlert={showAlert}
                  />
                }
              >
                <ListItemText primary={
                  <Typography variant="h6" gutterBottom><strong>Your grade:</strong> {gradeData[data.code]}</Typography>
                } />
              </ListItem>
            )}

          </List>
        </Box>

      </Paper>
    </>
  );
}

import { Grid, Paper, Typography, Box, useTheme } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  PlayCircleFilled as InProgressIcon,
  RadioButtonUnchecked as PendingIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

const TaskStats = ({ tasks }) => {
  const theme = useTheme();
  
  // Calculate stats
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  
  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // Stats data array
  const statsData = [
    {
      title: "Total Tasks",
      count: totalTasks,
      color: theme.palette.primary.main,
      icon: <AssignmentIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />,
    },
    {
      title: "Pending",
      count: pendingTasks,
      color: theme.palette.error.main,
      icon: <PendingIcon sx={{ fontSize: 35, color: theme.palette.error.main }} />,
    },
    {
      title: "In Progress",
      count: inProgressTasks,
      color: theme.palette.warning.main,
      icon: <InProgressIcon sx={{ fontSize: 35, color: theme.palette.warning.main }} />,
    },
    {
      title: "Completed",
      count: completedTasks,
      color: theme.palette.success.main,
      icon: <CheckCircleIcon sx={{ fontSize: 35, color: theme.palette.success.main }} />,
    },
  ];

  return (
    <>
      {/* Updated Grid usage for MUI Grid v2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((item, index) => (
          <Grid key={index} xs={12} sm={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: theme.shape.borderRadius,
                borderLeft: `4px solid ${item.color}`,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    {item.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ mt: 1, color: item.color, fontWeight: "bold" }}
                  >
                    {item.count}
                  </Typography>
                </Box>
                {item.icon}
              </Box>
              
              {/* Additional info for specific stats */}
              {item.title === "Completed" && totalTasks > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {completionPercentage}% of all tasks completed
                </Typography>
              )}
              
              {item.title === "Pending" && pendingTasks > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {Math.round((pendingTasks / totalTasks) * 100)}% of tasks still pending
                </Typography>
              )}
              
              {item.title === "In Progress" && inProgressTasks > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {Math.round((inProgressTasks / totalTasks) * 100)}% of tasks in progress
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Overall progress section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: theme.shape.borderRadius }}>
        <Typography variant="h6" gutterBottom>
          Overall Progress
        </Typography>
        
        <Box sx={{ 
          position: 'relative', 
          height: 12, 
          backgroundColor: theme.palette.grey[200],
          borderRadius: 6,
          mt: 2,
          mb: 1
        }}>
          <Box sx={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${completionPercentage}%`,
            backgroundColor: theme.palette.success.main,
            borderRadius: 6,
            transition: 'width 0.5s ease'
          }} />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="textSecondary">
            {completionPercentage}% Complete
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {completedTasks} of {totalTasks} tasks completed
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default TaskStats;
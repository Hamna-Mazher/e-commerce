// soft delete 
// hard delete
// get task which are soft deleted 


//hard delete
const hardDeleteTask =async (req,res)=>{
    try{
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "Task deleted successfully",
        })
    }catch(error){
        res.status(500).json({
            message: error.message,
        })
    }
        
    }

    //soft delete
    const softDeleteTask = async (req,res)=>{
        try{
            const task = await Task.findById(req.params.id);
            if(!task){
                return res.status(404).json({
                    message: "Task not found",
                })
            }
            task.deleted = true;
            await task.save();
            res.status(200).json({
                message: "Task soft deleted successfully",
            })
        } catch (error) {
            res.status(500).json({
                message: error.message,
            })
        }
    }
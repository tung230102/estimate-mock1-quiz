import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Avatar, Grid } from "@mui/material";
import { blue } from "@mui/material/colors";
import { useForm } from "react-hook-form";
import { changePassword } from "~/api";
import { CommonButton, CommonTextField, Heading, showToast } from "~/common";
import { statusCode } from "~/constants";

const color = blue[800];

function ChangePasswordField() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    changePassword(data).then((res) => {
      if (res?.statusCode === statusCode.OK) {
        showToast(res.message);
        reset();
      } else if (res?.statusCode === statusCode.BAD_REQUEST) {
        showToast(res?.message, "error");
      } else {
        showToast("Change password fail!", "error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid align="center">
        <Avatar sx={{ bgcolor: color }}>
          <LockOutlinedIcon />
        </Avatar>
        <Heading>Change Password</Heading>
      </Grid>
      <CommonTextField
        label="Old Password"
        name="oldPassword"
        type="password"
        register={register}
        errors={errors}
        required
      />
      <CommonTextField
        label="Password"
        name="newPassword"
        type="password"
        register={register}
        errors={errors}
        required
        minLength={7}
      />
      <CommonButton type="submit" fullWidth sx={{ mt: 1 }}>
        Update password
      </CommonButton>
    </form>
  );
}

export default ChangePasswordField;

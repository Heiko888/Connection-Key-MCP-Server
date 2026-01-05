import * as React from "react";
import TextField from "@mui/material/TextField";

export const Input = (props: React.ComponentProps<typeof TextField>) => (
	<TextField {...props} />
);

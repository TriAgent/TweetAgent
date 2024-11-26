import { SvgIcon, SvgIconProps } from "@mui/material";
import { FC } from "react";

export const LogoIcon: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12.5" r="10" fill="#FF4484" />
      <g clipPath="url(#clip0_1778_19701)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.613 13.055L10.1927 4.96387L6.36885 14.4044L9.98406 11.585L13.613 13.055ZM9.76394 12.1285L13.1842 20.2196L17.0144 10.7635L13.3929 13.5984L9.76394 12.1285Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_1778_19701">
          <rect
            width="8.5"
            height="13"
            fill="white"
            transform="translate(10.3805 4.50049) rotate(22.0505)"
          />
        </clipPath>
      </defs>
    </svg>
  </SvgIcon>
);

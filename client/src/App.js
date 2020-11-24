import React from "react";
import throttle from "lodash/throttle";
import {
  Container,
  withStyles,
  AppBar,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link,
  GridList,
  GridListTile,
  Divider,
  InputBase,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  Button,
  DialogActions,
  DialogContentText,
  TextField,
} from "@material-ui/core";

import Alert from "@material-ui/lab/Alert";

import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import FolderIcon from "@material-ui/icons/Folder";
import DescriptionIcon from "@material-ui/icons/Description";
import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import TheatersIcon from "@material-ui/icons/Theaters";
import MusicNoteIcon from "@material-ui/icons/MusicNote";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import CodeIcon from "@material-ui/icons/Code";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import SaveIcon from "@material-ui/icons/Save";

import { fade, withTheme } from "@material-ui/core/styles";

import withMediaQuery from "./components/withMediaQuery";

const style = (theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  itemsBox: {
    padding: "16px 0",
  },
  breadBox: {
    padding: "16px 16px 0 16px",
  },
  bottomInfo: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: "4px 18px",
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "24ch",
      "&:focus": {
        width: "32ch",
      },
    },
  },
  fab: {
    position: "fixed",
    bottom: 40,
    right: 20,
    [theme.breakpoints.up("sm")]: {
      bottom: 58,
      right: 40,
    },
  },
});
class App extends React.Component {
  constructor(props) {
    super(props);
    this.appRef = React.createRef();
    this.basePath = "/api";
    this.state = {
      files: [],
      folders: [],
      err: false,
      savingFile: false,
      dialog: {
        title: "",
        text: "",
        open: false,
        type: "", // text, video, photo, default
      },
      createDialogOpen: false,
      createDialog: {
        name: {},
        text: {},
        alert: {},
      },
      types: {
        png: "photo",
        jpeg: "photo",
        jpg: "photo",
        gif: "photo",
        tiff: "photo",
        psd: "photo",
        svg: "photo",
        ico: "photo",
        docx: "descX",
        doc: "descX",
        txt: "text",
        vtt: "text",
        pdf: "descX",
        md: "text",
        json: "text",
        mov: "videoX",
        mkv: "videoX",
        mp4: "video",
        wmv: "videoX",
        avi: "videoX",
        flv: "videoX",
        m4a: "music",
        flac: "music",
        wav: "music",
        mp3: "music",
        aac: "music",
        m4b: "music",
        ogg: "music",
        "3gp": "music",
        js: "code",
        jsx: "code",
        py: "code",
        kt: "code",
        java: "code",
        c: "code",
        cpp: "code",
        swift: "code",
        sh: "code",
        h: "code",
        php: "code",
        class: "code",
        pl: "code",
        cgi: "code",
      },
      loading: true,
    };
  }

  itemClick = (type, item, index) => {
    console.log(type, item, index);
    let ogPath = JSON.parse(JSON.stringify(this.state.path));
    if (type === 0) {
      // folder
      if (ogPath[0] === "/" && ogPath.length > 1) ogPath[0] = "";
      let p = ogPath.join("/") + "/" + item;
      this.fetchPath(p).then((res) => this.renderPath(res));
    } else if (type === 1) {
      // bread
      let compiledPath = ogPath.slice(0, index + 1);
      if (ogPath[0] === "/" && compiledPath.length > 1) compiledPath[0] = "";
      let p = compiledPath.join("/");
      console.log(p, ogPath);
      this.fetchPath(p).then((res) => this.renderPath(res));
    } else if (type === 2) {
      // file
      if (ogPath[0] === "/" && ogPath.length > 1) ogPath[0] = "";
      let p = encodeURIComponent(ogPath.join("/") + "/" + item.name);
      console.log(p, ogPath.join("/") + "/" + item.name);

      if (item.icon === "text" || item.icon === "code") {
        fetch(
          this.basePath +
            "/getFile/" +
            encodeURIComponent(item.name) +
            "?path=" +
            p
        )
          .then((r) => r.text())
          .then((r1) => {
            // debugger;
            this.setState({
              dialog: {
                open: true,
                title: item.name,
                text: r1,
                type: "text",
              },
            });
          });
      } else if (item.icon === "photo") {
        this.setState({
          dialog: {
            open: true,
            title: item.name,
            url:
              this.basePath +
              "/getFile/" +
              encodeURIComponent(item.name) +
              "?path=" +
              p,
            type: "photo",
          },
        });
      } else if (item.icon === "video") {
        this.setState({
          dialog: {
            open: true,
            title: item.name,
            url:
              this.basePath +
              "/video/" +
              encodeURIComponent(item.name) +
              "?path=" +
              p,
            type: "video",
          },
        });
      } else if (
        item.icon === "descX" ||
        item.icon === "default" ||
        item.icon === "music" ||
        item.icon === "videoX"
      ) {
        window.open(
          this.basePath +
            "/getFile/" +
            encodeURIComponent(item.name) +
            "?path=" +
            p,
          "_blank"
        );
      }
    }
  };

  dialogClose = () => {
    this.setState({
      dialog: {
        open: false,
        title: "",
        text: "",
        type: "",
      },
    });
  };

  closeCreateDialog = () => {
    this.setState(
      {
        createDialogOpen: false,
        createDialog: {
          name: {},
          text: {},
          alert: {},
        },
      },
      () => {
        let ogPath = JSON.parse(JSON.stringify(this.state.path));
        if (ogPath[0] === "/" && ogPath.length > 1) ogPath[0] = "";
        this.fetchPath(ogPath.join("/")).then((res) => this.renderPath(res));
      }
    );
  };

  openCreateDialog = () => {
    this.setState({
      createDialogOpen: true,
      createDialog: {
        name: {},
        text: {},
        alert: {},
      },
    });
  };

  saveFile = () => {
    if (!this.state.savingFile) {
      let fileName = document.getElementById("crFileName").value;
      let fileText = document.getElementById("crFileText").value;
      let createDialog = {
        name: {},
        text: {},
        alert: {},
      };
      if (fileName === "")
        createDialog.name = { err: true, errTxt: "Please fill this field" };
      if (fileText === "")
        createDialog.text = { err: true, errTxt: "Please fill this field" };

      this.setState({
        createDialog,
        savingFile: true,
      });
      if (fileName !== "" && fileText !== "") {
        let ogPath = JSON.parse(JSON.stringify(this.state.path));
        if (ogPath[0] === "/" && ogPath.length > 1) ogPath[0] = "";
        fetch(this.basePath + "/createFile", {
          method: "POST",
          body: JSON.stringify({
            filePath: ogPath.join("/") + "/" + fileName,
            text: fileText,
          }),
        })
          .then((r) => r.json())
          .then((res) => {
            let a;
            if (res.error)
              a = { open: true, severity: "error", text: res.message };
            else a = { open: true, severity: "success", text: res.message };
            this.setState({
              createDialog: {
                name: {},
                text: {},
                alert: a,
              },
              savingFile: false,
            });
          });
      }
    }
  };

  filterFiles = (ev) => {
    let query = ev.target.value.toLowerCase();
    this.setState((state) => ({
      files: state.OGfiles.filter((el) =>
        el.name.toLowerCase().includes(query)
      ),
      folders: state.OGfolders.filter((el) => el.toLowerCase().includes(query)),
    }));
  };

  componentDidMount() {
    this.fetchPath(".").then((res) => this.renderPath(res));
  }

  fetchPath = (path) => {
    return fetch(this.basePath + "/loadDir", {
      method: "POST",
      body: JSON.stringify({ path }),
    }).then((r) => r.json());
  };

  renderPath = (r) => {
    if (!r.error) {
      let files = r.files.map((el) => {
        let t = "default";
        if (this.state.types[el.type.slice(1)]) {
          t = this.state.types[el.type.slice(1)];
        }
        return { name: el.name, icon: t };
      });
      let path = r.resolvedPath.split("/");
      if (path[0] === "") path[0] = "/";
      this.setState({
        folders: r.folders,
        files,
        OGfiles: files,
        OGfolders: r.folders,
        path,
        loading: false,
        err: false,
      });
    } else {
      this.setState({ err: r, loading: false });
    }
  };

  fileIcon(type) {
    if (type === "photo")
      return <PhotoSizeSelectActualIcon style={{ fontSize: "5rem" }} />;
    if (type === "video" || type === "videoX")
      return <TheatersIcon style={{ fontSize: "5rem" }} />;
    if (type === "music") return <MusicNoteIcon style={{ fontSize: "5rem" }} />;
    if (type === "code") return <CodeIcon style={{ fontSize: "5rem" }} />;
    if (type === "default")
      return <InsertDriveFileIcon style={{ fontSize: "5rem" }} />;
    if (type === "text" || type === "descX")
      return <DescriptionIcon style={{ fontSize: "5rem" }} />;
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="sticky">
          <Toolbar>
            <Typography className={classes.title} variant="h6" noWrap>
              File Explorer
            </Typography>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                onChange={throttle(this.filterFiles, 200)}
                inputProps={{ "aria-label": "search" }}
                disabled={this.state.loading}
              />
            </div>
          </Toolbar>
        </AppBar>
        {this.state.loading && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress color="secondary" />
          </div>
        )}
        {!this.state.loading && (
          <>
            <Container maxWidth="lg">
              <Breadcrumbs
                maxItems={5}
                itemsBeforeCollapse={2}
                itemsAfterCollapse={2}
                separator={<ChevronRightIcon fontSize="default" />}
                className={classes.breadBox}
              >
                {this.state.path?.map((el, i) => (
                  <Link
                    onClick={() => this.itemClick(1, el, i)}
                    key={el}
                    href="#"
                    color={
                      this.state.path.length - 1 === i
                        ? "textPrimary"
                        : "inherit"
                    }
                  >
                    {el}
                  </Link>
                ))}
              </Breadcrumbs>
              <div className={classes.itemsBox}>
                <GridList cellHeight={120} cols={this.props.mediaQuery ? 5 : 3}>
                  {this.state.folders?.map((folder, i) => (
                    <GridListTile
                      key={i}
                      cols={1}
                      onClick={() => this.itemClick(0, folder, i)}
                    >
                      <div style={{ textAlign: "center" }}>
                        <FolderIcon style={{ fontSize: "5rem" }} />
                      </div>
                      <Typography align="center" variant="body2" title={folder}>
                        {folder}
                      </Typography>
                    </GridListTile>
                  ))}
                </GridList>
                <Divider light variant="middle" />
                <GridList
                  cellHeight={120}
                  cols={this.props.mediaQuery ? 5 : 3}
                  style={{ padding: "16px 0" }}
                >
                  {this.state.files?.map((file, i) => (
                    <GridListTile
                      key={i}
                      cols={1}
                      onClick={() => this.itemClick(2, file, i)}
                    >
                      <div style={{ textAlign: "center" }}>
                        {this.fileIcon(file.icon)}
                      </div>
                      <Typography
                        align="center"
                        variant="body2"
                        title={file.name}
                      >
                        {file.name}
                      </Typography>
                    </GridListTile>
                  ))}
                </GridList>
              </div>
            </Container>
            <div className={classes.bottomInfo}>
              {this.state.files.length + this.state.folders.length} items ({" "}
              {this.state.folders.length} folders, {this.state.files.length}{" "}
              files )
            </div>
          </>
        )}
        {this.state.err && (
          <h1>There is an err : {JSON.stringify(this.state.err)}</h1>
        )}
        <Dialog open={this.state.createDialogOpen}>
          <DialogTitle style={{ padding: "16px 24px 0 24px" }}>
            Create File
          </DialogTitle>
          <DialogContent>
            {this.state.createDialog.alert.open && (
              <Alert severity={this.state.createDialog.alert.severity}>
                {this.state.createDialog.alert.text}
              </Alert>
            )}
            <DialogContentText>
              File will be created in current directory
            </DialogContentText>
            <TextField
              autoFocus
              error={this.state.createDialog.name.err}
              helperText={this.state.createDialog.name.errTxt}
              margin="dense"
              multiline={true}
              label="File Name"
              id="crFileName"
              fullWidth
            />
            <TextField
              margin="normal"
              error={this.state.createDialog.text.err}
              helperText={this.state.createDialog.text.errTxt}
              rows={4}
              rowsMax={10}
              id="crFileText"
              multiline={true}
              label="Text"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.closeCreateDialog}
              // variant="contained"
              color="secondary"
            >
              Close
            </Button>
            <Button
              // variant="contained"
              onClick={this.saveFile}
              disabled={this.state.savingFile}
              startIcon={
                this.state.savingFile ? (
                  <CircularProgress size={20} />
                ) : (
                  <SaveIcon />
                )
              }
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          fullScreen={!this.props.mediaQuery}
          open={this.state.dialog.open}
          onClose={this.dialogClose}
          scroll="paper"
          maxWidth="lg"
        >
          <DialogTitle>{this.state.dialog.title}</DialogTitle>
          <DialogContent dividers={true}>
            {this.state.dialog.type === "text" && (
              <pre>{this.state.dialog.text}</pre>
            )}
            {this.state.dialog.type === "photo" && (
              <img
                src={this.state.dialog.url}
                alt={this.state.dialog.title}
                style={{
                  minWidth: "100%",
                  width: this.props.mediaQuery ? "auto" : "312px",
                  height: "auto",
                }}
              />
            )}
            {this.state.dialog.type === "video" && (
              <video
                controls
                autoPlay
                style={{
                  minWidth: "100%",
                  minHeight: "100%",
                  width: this.props.mediaQuery ? "auto" : "312px",
                  height: "auto",
                }}
              >
                <source src={this.state.dialog.url} type="video/mp4" />
              </video>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.dialogClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Fab
          className={classes.fab}
          color="primary"
          size={this.props.mediaQuery ? "large" : "medium"}
          onClick={this.openCreateDialog}
          aria-label="add"
        >
          <AddIcon />
        </Fab>
      </div>
    );
  }
}

export default withStyles(style)(
  withMediaQuery("(min-width:600px)")(withTheme(App))
);
